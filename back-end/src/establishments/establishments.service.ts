import { Injectable } from '@nestjs/common';
import { Establishment, EstablishmentStatus } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { docToDb, toEstablishment } from '../prisma/mappers';

type CreateInput = Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable()
export class EstablishmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    status?: EstablishmentStatus;
    vendedorId?: string;
    bairro?: string;
  }): Promise<Establishment[]> {
    const rows = await this.prisma.establishment.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.vendedorId && { vendedorId: filters.vendedorId }),
        ...(filters?.bairro && { bairro: filters.bairro }),
      },
    });

    // Priorização: potencial (alto > normal > baixo) e depois leads primeiro
    const ordemPotencial = { alto: 0, normal: 1, baixo: 2 };
    return rows.map(toEstablishment).sort((a, b) => {
      if (ordemPotencial[a.potencial] !== ordemPotencial[b.potencial]) {
        return ordemPotencial[a.potencial] - ordemPotencial[b.potencial];
      }
      if (a.status === 'lead' && b.status !== 'lead') return -1;
      if (a.status !== 'lead' && b.status === 'lead') return 1;
      return 0;
    });
  }

  async findById(id: string): Promise<Establishment | undefined> {
    const row = await this.prisma.establishment.findUnique({ where: { id } });
    return row ? toEstablishment(row) : undefined;
  }

  async create(data: CreateInput): Promise<Establishment> {
    const row = await this.prisma.establishment.create({
      data: {
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia,
        cnpj: data.cnpj,
        segmento: data.segmento,
        tipoDoc: docToDb(data.tipoDoc),
        potencial: data.potencial,
        status: data.status,
        endereco: data.endereco,
        telefone: data.telefone,
        bairro: data.bairro,
        fornecedorAtual: data.fornecedorAtual,
        melhorHorario: data.melhorHorario,
        notasContexto: data.notasContexto,
        score: data.score,
        vendedorId: data.vendedorId,
      },
    });
    return toEstablishment(row);
  }

  async updateStatus(id: string, newStatus: EstablishmentStatus): Promise<Establishment | undefined> {
    const exists = await this.prisma.establishment.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return undefined;
    const row = await this.prisma.establishment.update({
      where: { id },
      data: { status: newStatus },
    });
    return toEstablishment(row);
  }
}
