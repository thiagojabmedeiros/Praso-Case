import { Injectable } from '@nestjs/common';
import { Seller } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { toSeller } from '../prisma/mappers';

@Injectable()
export class SellersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Seller | undefined> {
    const row = await this.prisma.seller.findUnique({ where: { id } });
    return row ? toSeller(row) : undefined;
  }

  async findAll(): Promise<Seller[]> {
    const rows = await this.prisma.seller.findMany({
      orderBy: { pontuacaoAcumulada: 'desc' },
    });
    return rows.map(toSeller);
  }

  async updateScore(id: string, pontos: number): Promise<Seller | undefined> {
    const exists = await this.prisma.seller.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return undefined;
    const row = await this.prisma.seller.update({
      where: { id },
      data: { pontuacaoAcumulada: { increment: pontos } },
    });
    return toSeller(row);
  }
}
