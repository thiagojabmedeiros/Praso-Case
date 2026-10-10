import { Injectable } from '@nestjs/common';
import { Visit } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { resultToDb, toVisit } from '../prisma/mappers';
import { pontosDeAquisicao } from './pontuacao';

// `compra` é opcional e só vale quando o resultado da visita é "compra".
type CreateInput = Omit<Visit, 'id' | 'createdAt'> & {
  compra?: { valor: number; autonoma: boolean };
};

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra a visita e aplica os efeitos no estabelecimento e no vendedor:
   * - cadastrou: lead vira oportunidade e o vendedor ganha os pontos de aquisição
   * - compra: registra a compra (com valor) e o estabelecimento vira cliente
   * Os pontos são dados uma única vez, quando o estabelecimento sai de lead.
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

      const est = await tx.establishment.findUnique({ where: { id: data.establishmentId } });
      const conquistou = data.resultado === 'cadastrou' || data.resultado === 'compra';

      if (est && est.status === 'lead' && conquistou) {
        const novoStatus = data.resultado === 'compra' ? 'cliente' : 'oportunidade';
        const tipoDoc = est.tipoDoc === 'MEI' ? 'MEI' : est.tipoDoc === 'NAO_MEI' ? 'nao-MEI' : null;
        const pontos = pontosDeAquisicao(est.potencial, tipoDoc);
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
          },
        });
      }

      return toVisit(row);
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
