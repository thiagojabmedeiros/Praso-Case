import { Injectable } from '@nestjs/common';
import { Purchase } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { toPurchase } from '../prisma/mappers';

type CreateInput = Omit<Purchase, 'id' | 'createdAt'>;

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInput): Promise<Purchase> {
    const row = await this.prisma.purchase.create({
      data: {
        establishmentId: data.establishmentId,
        vendedorId: data.vendedorId,
        data: new Date(data.data),
        valor: data.valor,
        autonoma: data.autonoma,
      },
    });
    return toPurchase(row);
  }

  async findByEstablishmentId(establishmentId: string): Promise<Purchase[]> {
    const rows = await this.prisma.purchase.findMany({
      where: { establishmentId },
      orderBy: { data: 'desc' },
    });
    return rows.map(toPurchase);
  }

  async findByVendedorId(vendedorId: string): Promise<Purchase[]> {
    const rows = await this.prisma.purchase.findMany({
      where: { vendedorId },
      orderBy: { data: 'desc' },
    });
    return rows.map(toPurchase);
  }

  async findAutonomousByEstablishment(establishmentId: string): Promise<Purchase[]> {
    const rows = await this.prisma.purchase.findMany({
      where: { establishmentId, autonoma: true },
      orderBy: { data: 'desc' },
    });
    return rows.map(toPurchase);
  }
}
