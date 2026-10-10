import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Visit } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, type Visit as VisitRow } from '../generated/prisma/client';
import { resultToDb, toVisit } from '../prisma/mappers';
import { pontosDeAquisicao } from './pontuacao';
import { registrarRecorrencia } from '../purchases/recorrencia';
import { MENSAGEM_META_BATIDA, metaBatidaPorCompras } from '../purchases/ciclo';
import { CATEGORIAS, type CategoriaFornecimentoInput } from '../fornecimentos/fornecimentos.service';

// `compra` é opcional e só vale quando o resultado da visita é "compra".
export type CreateInput = Omit<Visit, 'id' | 'createdAt' | 'pontosGerados' | 'anuladaEm' | 'motivoAnulacao' | 'compra'> & {
  compra?: { valor: number; autonoma: boolean };
  // Fornecedores cadastrados nesta visita. Só são gravados junto com a visita (mesma transação).
  fornecimentos?: { distribuidora: string; categoria: string }[];
};

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra a visita e aplica os efeitos no estabelecimento e no vendedor:
   * - cadastrou: lead vira oportunidade e o vendedor ganha os pontos de aquisição
   * - compra: registra a compra (com valor) e o estabelecimento vira cliente
   * - 3ª compra autônoma: o vendedor ganha os pontos de recorrência
   * Os pontos são guardados na visita, para poderem ser desfeitos numa anulação.
   */
  async create(data: CreateInput): Promise<Visit> {
    // Visita de compra só existe com uma compra de valor positivo: nunca gravamos compra de R$ 0.
    if (data.resultado === 'compra' && !(data.compra && data.compra.valor > 0)) {
      throw new BadRequestException('Informe o valor da compra (maior que zero)');
    }

    return this.prisma.$transaction(async (tx) => {
      const compras = await tx.purchase.findMany({
        where: { establishmentId: data.establishmentId },
        orderBy: { data: 'asc' },
        select: { data: true, autonoma: true },
      });
      if (metaBatidaPorCompras(compras)) throw new ConflictException(MENSAGEM_META_BATIDA);
      const row = await tx.visit.create({
        data: {
          establishmentId: data.establishmentId,
          vendedorId: data.vendedorId,
          dataHora: new Date(data.dataHora),
          tipo: data.tipo,
          resultado: resultToDb(data.resultado),
          geoLat: data.geo?.lat ?? null,
          geoLng: data.geo?.lng ?? null,
          geoAccuracy: data.geo?.accuracy ?? null,
          nota: data.nota ?? '',
          proximoContato: data.proximoContato ? new Date(data.proximoContato) : null,
          melhorTurno: data.melhorTurno ?? null,
        },
      });

      // Fornecedores da visita: criados aqui, ligados a ela. Se algo falhar, a visita inteira é desfeita.
      for (const f of data.fornecimentos ?? []) {
        const nome = (f.distribuidora ?? '').trim();
        if (!nome) throw new BadRequestException('Informe o nome da distribuidora');
        if (!(CATEGORIAS as readonly string[]).includes(f.categoria)) {
          throw new BadRequestException('Categoria de fornecedor inválida');
        }
        const categoria = f.categoria as CategoriaFornecimentoInput;
        const existente = await tx.distribuidora.findFirst({
          where: { nome: { equals: nome, mode: 'insensitive' } },
        });
        const distribuidora = existente ?? (await tx.distribuidora.create({ data: { nome } }));
        // Se o fornecimento já existia, não é cadastro desta visita: não é ligado a ela.
        const ja = await tx.fornecimento.findUnique({
          where: {
            establishmentId_distribuidoraId_categoria: {
              establishmentId: data.establishmentId,
              distribuidoraId: distribuidora.id,
              categoria,
            },
          },
        });
        if (!ja) {
          await tx.fornecimento.create({
            data: { establishmentId: data.establishmentId, distribuidoraId: distribuidora.id, categoria, visitId: row.id },
          });
        }
      }

      let pontos = 0;
      // O turno informado na visita vale para o estabelecimento até a próxima informação.
      if (data.melhorTurno) {
        await tx.establishment.update({
          where: { id: data.establishmentId },
          data: { melhorTurno: data.melhorTurno },
        });
      }

      const est = await tx.establishment.findUnique({ where: { id: data.establishmentId } });
      const conquistou = data.resultado === 'cadastrou' || data.resultado === 'compra';

      if (est && est.status === 'lead' && conquistou) {
        const novoStatus = data.resultado === 'compra' ? 'cliente' : 'oportunidade';
        const tipoDoc = est.tipoDoc === 'MEI' ? 'MEI' : est.tipoDoc === 'NAO_MEI' ? 'nao-MEI' : null;
        pontos += pontosDeAquisicao(est.potencial, tipoDoc);
        await tx.establishment.update({
          where: { id: est.id },
          data: { status: novoStatus, score: pontos },
        });
        await tx.seller.update({
          where: { id: data.vendedorId },
          data: { pontuacaoAcumulada: { increment: pontos } },
        });
      } else if (est && est.status === 'oportunidade' && data.resultado === 'compra') {
        await tx.establishment.update({ where: { id: est.id }, data: { status: 'cliente' } });
      }

      if (data.resultado === 'compra' && data.compra) {
        await tx.purchase.create({
          data: {
            establishmentId: data.establishmentId,
            vendedorId: data.vendedorId,
            data: new Date(data.dataHora),
            valor: data.compra.valor,
            autonoma: data.compra.autonoma,
            visitId: row.id,
          },
        });
        if (data.compra.autonoma) {
          pontos += await registrarRecorrencia(tx, data.establishmentId, data.vendedorId);
        }
      }

      const atualizada = pontos > 0
        ? await tx.visit.update({ where: { id: row.id }, data: { pontosGerados: pontos } })
        : row;
      const compra = await tx.purchase.findFirst({ where: { visitId: row.id }, select: { valor: true, autonoma: true } });
      return toVisit(atualizada, compra ? { valor: Number(compra.valor), autonoma: compra.autonoma } : null);
    });
  }

  /**
   * Anula uma visita com motivo. Desfaz o que ela gerou: pontos do vendedor e do
   * estabelecimento, a compra criada por ela e o status do estabelecimento.
   * A visita continua no histórico, marcada como anulada.
   */
  async anular(id: string, motivo: string): Promise<Visit> {
    if (!motivo || !motivo.trim()) {
      throw new BadRequestException('Informe o motivo da anulação');
    }

    return this.prisma.$transaction(async (tx) => {
      const visita = await tx.visit.findUnique({ where: { id } });
      if (!visita) throw new NotFoundException('Visita não encontrada');
      if (visita.anuladaEm) throw new BadRequestException('Visita já anulada');

      if (visita.pontosGerados > 0) {
        await tx.seller.update({
          where: { id: visita.vendedorId },
          data: { pontuacaoAcumulada: { decrement: visita.pontosGerados } },
        });
        const est = await tx.establishment.findUnique({ where: { id: visita.establishmentId } });
        if (est) {
          await tx.establishment.update({
            where: { id: est.id },
            data: { score: Math.max(0, est.score - visita.pontosGerados) },
          });
        }
      }

      // Marca a visita como anulada antes de recalcular, para ela não contar como conquista.
      const anulada = await tx.visit.update({
        where: { id },
        data: { anuladaEm: new Date(), motivoAnulacao: motivo.trim() },
      });

      await tx.purchase.deleteMany({ where: { visitId: id } });

      if (visita.pontosGerados > 0 || visita.resultado === 'compra') {
        await recalcularStatus(tx, visita.establishmentId);
      }

      return toVisit(anulada);
    });
  }

  async findByEstablishmentId(establishmentId: string): Promise<Visit[]> {
    const rows = await this.prisma.visit.findMany({
      where: { establishmentId },
      orderBy: { createdAt: 'desc' },
    });
    return this.comCompras(rows);
  }

  async findAll(): Promise<Visit[]> {
    const rows = await this.prisma.visit.findMany({ orderBy: { createdAt: 'desc' } });
    return this.comCompras(rows);
  }

  /** Anexa a compra de cada visita (uma consulta só, em vez de uma por visita). */
  private async comCompras(rows: VisitRow[]): Promise<Visit[]> {
    if (rows.length === 0) return [];
    const compras = await this.prisma.purchase.findMany({
      where: { visitId: { in: rows.map((r) => r.id) } },
      select: { visitId: true, valor: true, autonoma: true },
    });
    const porVisita = new Map(
      compras.map((c) => [c.visitId as string, { valor: Number(c.valor), autonoma: c.autonoma }]),
    );
    return rows.map((r) => toVisit(r, porVisita.get(r.id) ?? null));
  }
}

/**
 * Recalcula o status a partir do que restou: com compra vira cliente; com cadastro
 * (visita válida) vira oportunidade; sem nada vira lead. Churn não é mexido.
 */
async function recalcularStatus(tx: Prisma.TransactionClient, establishmentId: string) {
  const est = await tx.establishment.findUnique({ where: { id: establishmentId } });
  if (!est || est.status === 'churn') return;

  const compras = await tx.purchase.count({ where: { establishmentId } });
  let status: 'lead' | 'oportunidade' | 'cliente';
  if (compras > 0) {
    status = 'cliente';
  } else {
    const conquistas = await tx.visit.count({
      where: { establishmentId, anuladaEm: null, resultado: { in: ['cadastrou', 'compra'] } },
    });
    status = conquistas > 0 ? 'oportunidade' : 'lead';
  }

  if (status !== est.status) {
    await tx.establishment.update({ where: { id: establishmentId }, data: { status } });
  }
}
