import { Injectable } from '@nestjs/common';
import { Visit } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { resultToDb, toVisit } from '../prisma/mappers';

type CreateInput = Omit<Visit, 'id' | 'createdAt'>;

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInput): Promise<Visit> {
    const row = await this.prisma.visit.create({
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
    return toVisit(row);
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
