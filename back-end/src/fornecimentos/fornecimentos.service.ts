import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const CATEGORIAS = ['carne', 'pao', 'bebidas', 'laticinios', 'hortifruti', 'mercearia', 'embalagens', 'outros'] as const;
export type CategoriaFornecimentoInput = (typeof CATEGORIAS)[number];

export interface FornecimentoView {
  id: string;
  categoria: CategoriaFornecimentoInput;
  distribuidora: { id: string; nome: string };
}

const include = { distribuidora: { select: { id: true, nome: true } } } as const;

function toView(row: {
  id: string;
  categoria: CategoriaFornecimentoInput;
  distribuidora: { id: string; nome: string };
}): FornecimentoView {
  return { id: row.id, categoria: row.categoria, distribuidora: row.distribuidora };
}

@Injectable()
export class FornecimentosService {
  constructor(private prisma: PrismaService) {}

  listarDistribuidoras() {
    return this.prisma.distribuidora.findMany({ orderBy: { nome: 'asc' }, select: { id: true, nome: true } });
  }

  async listarDoEstabelecimento(establishmentId: string): Promise<FornecimentoView[]> {
    const rows = await this.prisma.fornecimento.findMany({
      where: { establishmentId },
      include,
      orderBy: [{ categoria: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toView);
  }

  /**
   * Registra que uma distribuidora fornece uma categoria ao estabelecimento.
   * Cria a distribuidora se ela ainda não existir (comparação sem diferenciar maiúsculas).
   * Se o mesmo fornecimento já existir, devolve o existente.
   */
  async adicionar(establishmentId: string, nomeDistribuidora: string, categoria: string): Promise<FornecimentoView> {
    const nome = (nomeDistribuidora ?? '').trim();
    if (!nome) throw new BadRequestException('Informe o nome da distribuidora');
    if (!(CATEGORIAS as readonly string[]).includes(categoria)) {
      throw new BadRequestException('Categoria inválida');
    }

    const est = await this.prisma.establishment.findUnique({ where: { id: establishmentId }, select: { id: true } });
    if (!est) throw new NotFoundException('Estabelecimento não encontrado');

    const existente = await this.prisma.distribuidora.findFirst({
      where: { nome: { equals: nome, mode: 'insensitive' } },
    });
    const distribuidora =
      existente ?? (await this.prisma.distribuidora.create({ data: { nome } }));

    const row = await this.prisma.fornecimento.upsert({
      where: {
        establishmentId_distribuidoraId_categoria: {
          establishmentId,
          distribuidoraId: distribuidora.id,
          categoria: categoria as CategoriaFornecimentoInput,
        },
      },
      update: {},
      create: {
        establishmentId,
        distribuidoraId: distribuidora.id,
        categoria: categoria as CategoriaFornecimentoInput,
      },
      include,
    });
    return toView(row);
  }

  async remover(id: string): Promise<{ removido: boolean }> {
    const result = await this.prisma.fornecimento.deleteMany({ where: { id } });
    if (result.count === 0) throw new NotFoundException('Fornecimento não encontrado');
    return { removido: true };
  }
}
