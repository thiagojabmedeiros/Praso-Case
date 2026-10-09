import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toEstablishment } from '../prisma/mappers';
import { FollowUpsService } from '../followups/followups.service';
import { Establishment, FollowUp } from '../types';
import { haversineKm, pontuar } from './scoring';

const DIA_MS = 24 * 60 * 60 * 1000;

export interface Recomendacao {
  establishment: Establishment;
  score: number;
  motivos: string[];
}

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private followUps: FollowUpsService,
  ) {}

  /**
   * Estabelecimentos do vendedor ordenados pela pontuação do momento.
   * `origem` é a posição do vendedor (GPS). Sem ela, a distância não entra no ranking.
   */
  async recomendar(
    vendedorId: string,
    agora: Date = new Date(),
    origem?: { lat: number; lng: number },
  ): Promise<Recomendacao[]> {
    const rows = await this.prisma.establishment.findMany({ where: { vendedorId } });
    const ids = rows.map((r) => r.id);

    const followups = await this.followUps.findByVendedor(vendedorId);
    const followupPorEst = new Map<string, FollowUp>(
      followups.map((f) => [f.establishmentId, f]),
    );

    const visitas = await this.prisma.visit.findMany({
      where: { establishmentId: { in: ids }, anuladaEm: null },
      select: { establishmentId: true, dataHora: true },
      orderBy: { dataHora: 'desc' },
    });
    const ultimaVisita = new Map<string, Date>();
    for (const v of visitas) {
      if (!ultimaVisita.has(v.establishmentId)) ultimaVisita.set(v.establishmentId, v.dataHora);
    }

    return rows
      .map((row) => {
        const establishment = toEstablishment(row);
        const followup = followupPorEst.get(row.id);
        const ultima = ultimaVisita.get(row.id);
        const temCoordenadas = row.latitude !== null && row.longitude !== null;
        const distanciaKm =
          origem && temCoordenadas
            ? haversineKm(origem, { lat: row.latitude as number, lng: row.longitude as number })
            : null;

        const { score, motivos } = pontuar(
          {
            potencial: establishment.potencial,
            melhorHorario: establishment.melhorHorario,
            urgencia: followup?.urgencia ?? null,
            diasRestantes: followup?.diasRestantes ?? null,
            diasDesdeUltimaVisita: ultima
              ? Math.floor((agora.getTime() - ultima.getTime()) / DIA_MS)
              : null,
            distanciaKm,
          },
          agora,
        );
        return { establishment, score, motivos };
      })
      .sort((a, b) => b.score - a.score);
  }
}
