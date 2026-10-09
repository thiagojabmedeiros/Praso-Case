import { Injectable } from '@nestjs/common';
import { Visit, VisitResult } from '../types';
import { randomBytes } from 'crypto';

@Injectable()
export class VisitsService {
  private visits: Map<string, Visit> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const seeds: Visit[] = [
      {
        id: 'vis-001',
        establishmentId: 'est-004',
        vendedorId: 'seller-1',
        dataHora: new Date('2026-09-15T14:30:00'),
        tipo: 'efetiva',
        resultado: 'cadastrou',
        geo: { lat: -8.0476, lng: -34.8770, accuracy: 15 },
        nota: 'Proprietário muito atento a preço',
        createdAt: new Date('2026-09-15T14:30:00'),
      },
      {
        id: 'vis-002',
        establishmentId: 'est-004',
        vendedorId: 'seller-1',
        dataHora: new Date('2026-09-22T15:00:00'),
        tipo: 'efetiva',
        resultado: 'compra',
        geo: { lat: -8.0476, lng: -34.8770, accuracy: 12 },
        nota: '1ª compra realizada',
        createdAt: new Date('2026-09-22T15:00:00'),
      },
      {
        id: 'vis-003',
        establishmentId: 'est-006',
        vendedorId: 'seller-1',
        dataHora: new Date('2026-08-20T08:15:00'),
        tipo: 'efetiva',
        resultado: 'cadastrou',
        geo: { lat: -8.0500, lng: -34.8800, accuracy: 10 },
        nota: 'Gerente muito receptivo',
        createdAt: new Date('2026-08-20T08:15:00'),
      },
      {
        id: 'vis-004',
        establishmentId: 'est-001',
        vendedorId: 'seller-1',
        dataHora: new Date('2026-10-03T14:00:00'),
        tipo: 'planejada',
        resultado: 'em-acompanhamento',
        geo: undefined,
        nota: 'Primeira visita planejada',
        createdAt: new Date('2026-10-03T14:00:00'),
      },
    ];

    seeds.forEach((v) => {
      this.visits.set(v.id, v);
    });
  }

  create(data: Omit<Visit, 'id' | 'createdAt'>): Visit {
    const visit: Visit = {
      ...data,
      id: `vis-${randomBytes(4).toString('hex')}`,
      createdAt: new Date(),
    };
    this.visits.set(visit.id, visit);
    return visit;
  }

  findByEstablishmentId(establishmentId: string): Visit[] {
    return Array.from(this.visits.values())
      .filter((v) => v.establishmentId === establishmentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findAll(): Visit[] {
    return Array.from(this.visits.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
