import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Visit } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { resultToDb, toVisit } from '../prisma/mappers';
import { pontosDeAquisicao } from './pontuacao';
import { registrarRecorrencia } from '../purchases/recorrencia';

// `compra` é opcional e só vale quando o resultado da visita é "compra".
type CreateInput = Omit<Visit, 'id' | 'createdAt' | 'pontosGerados' | 'anuladaEm' | 'motivoAnulacao'> & {
  compra?: { valor: number; autonoma: boolean };
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
    return this.prisma.$transaction(async (tx) => {
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
        },
      });

      let pontos = 0;
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
      return toVisit(atualizada);
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
    return rows.map(toVisit);
  }

  async findAll(): Promise<Visit[]> {
    const rows = await this.prisma.visit.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toVisit);
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
