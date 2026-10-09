import { Injectable } from '@nestjs/common';
import { Establishment, EstablishmentStatus } from '../types';
import { randomBytes } from 'crypto';

@Injectable()
export class EstablishmentsService {
  private establishments: Map<string, Establishment> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const seeds: Establishment[] = [
      {
        id: 'est-001',
        razaoSocial: 'Restaurante Bom Paladar LTDA',
        nomeFantasia: 'Bom Paladar',
        cnpj: '12.345.678/0001-90',
        segmento: 'restaurante',
        tipoDoc: 'nao-MEI',
        potencial: 'alto',
        status: 'lead',
        endereco: 'Rua A, 123',
        bairro: 'Centro',
        fornecedorAtual: 'Fornecedor X',
        melhorHorario: '14:00',
        notasContexto: 'Proprietário atento a preço',
        score: 0,
        createdAt: new Date('2026-10-01'),
        updatedAt: new Date('2026-10-01'),
      },
      {
        id: 'est-002',
        razaoSocial: 'Padaria da Dona Maria',
        nomeFantasia: 'Dona Maria',
        cnpj: '98.765.432/0001-11',
        segmento: 'padaria',
        tipoDoc: 'MEI',
        potencial: 'normal',
        status: 'lead',
        endereco: 'Av. Principal, 456',
        bairro: 'Bairro Novo',
        fornecedorAtual: 'Fornecedor Y',
        melhorHorario: '08:00',
        notasContexto: 'Gerenciado pelo filho',
        score: 0,
        createdAt: new Date('2026-10-01'),
        updatedAt: new Date('2026-10-01'),
      },
      {
        id: 'est-003',
        razaoSocial: 'Lanchonete Rápido Bom',
        nomeFantasia: 'Rápido Bom',
        cnpj: '55.555.555/0001-55',
        segmento: 'lanchonete',
        tipoDoc: 'nao-MEI',
        potencial: 'alto',
        status: 'oportunidade',
        endereco: 'Rua B, 789',
        bairro: 'Centro',
        fornecedorAtual: 'Fornecedor X',
        melhorHorario: '11:00',
        notasContexto: 'Cadastrou mas não comprou ainda',
        score: 0,
        createdAt: new Date('2026-09-25'),
        updatedAt: new Date('2026-10-01'),
      },
      {
        id: 'est-004',
        razaoSocial: 'Pizzaria Massa e Arte',
        nomeFantasia: 'Massa e Arte',
        cnpj: '11.111.111/0001-11',
        segmento: 'pizzaria',
        tipoDoc: 'nao-MEI',
        potencial: 'alto',
        status: 'cliente',
        endereco: 'Rua C, 321',
        bairro: 'Bairro Novo',
        fornecedorAtual: 'Fornecedor Z',
        melhorHorario: '17:00',
        notasContexto: '2ª compra realizada, falta 1 para recorrência',
        score: 1,
        createdAt: new Date('2026-09-15'),
        updatedAt: new Date('2026-10-01'),
      },
      {
        id: 'est-005',
        razaoSocial: 'Hamburgueria do João',
        nomeFantasia: 'Hamburgueria João',
        cnpj: '22.222.222/0001-22',
        segmento: 'hamburgueria',
        tipoDoc: 'MEI',
        potencial: 'normal',
        status: 'lead',
        endereco: 'Rua D, 654',
        bairro: 'Zona Leste',
        fornecedorAtual: 'Fornecedor X',
        melhorHorario: '12:00',
        notasContexto: 'Aberto há 6 meses',
        score: 0,
        createdAt: new Date('2026-10-02'),
        updatedAt: new Date('2026-10-02'),
      },
      {
        id: 'est-006',
        razaoSocial: 'Cafeteria Espresso Forte',
        nomeFantasia: 'Espresso Forte',
        cnpj: '33.333.333/0001-33',
        segmento: 'cafeteria',
        tipoDoc: 'MEI',
        potencial: 'normal',
        status: 'cliente',
        endereco: 'Av. Secundária, 987',
        bairro: 'Centro',
        fornecedorAtual: 'Fornecedor Y',
        melhorHorario: '08:00',
        notasContexto: '3ª compra alcançada! Cliente recorrente',
        score: 0.5,
        createdAt: new Date('2026-08-20'),
        updatedAt: new Date('2026-09-30'),
      },
      {
        id: 'est-007',
        razaoSocial: 'Bar do Seu Zé',
        nomeFantasia: 'Bar do Zé',
        cnpj: '44.444.444/0001-44',
        segmento: 'bar',
        tipoDoc: 'MEI',
        potencial: 'alto',
        status: 'churn',
        endereco: 'Rua E, 111',
        bairro: 'Zona Oeste',
        fornecedorAtual: 'Fornecedor W',
        melhorHorario: '18:00',
        notasContexto: '120+ dias sem comprar. Precisa de reativação',
        score: 0.5,
        createdAt: new Date('2026-06-15'),
        updatedAt: new Date('2026-09-01'),
      },
    ];

    seeds.forEach((est) => {
      this.establishments.set(est.id, est);
    });
  }

  findAll(filters?: {
    status?: EstablishmentStatus;
    vendedorId?: string;
    bairro?: string;
  }): Establishment[] {
    let results = Array.from(this.establishments.values());

    if (filters?.status) {
      results = results.filter((e) => e.status === filters.status);
    }
    if (filters?.bairro) {
      results = results.filter((e) => e.bairro === filters.bairro);
    }

    // Priorização: alto potencial + leads/oportunidades primeiro
    return results.sort((a, b) => {
      if (a.potencial === 'alto' && b.potencial !== 'alto') return -1;
      if (a.potencial !== 'alto' && b.potencial === 'alto') return 1;
      if (a.status === 'lead' && b.status !== 'lead') return -1;
      if (a.status !== 'lead' && b.status === 'lead') return 1;
      return 0;
    });
  }

  findById(id: string): Establishment | undefined {
    return this.establishments.get(id);
  }

  create(data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>): Establishment {
    const est: Establishment = {
      ...data,
      id: `est-${randomBytes(4).toString('hex')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.establishments.set(est.id, est);
    return est;
  }

  updateStatus(id: string, newStatus: EstablishmentStatus): Establishment | undefined {
    const est = this.establishments.get(id);
    if (!est) return undefined;
    est.status = newStatus;
    est.updatedAt = new Date();
    return est;
  }
}
