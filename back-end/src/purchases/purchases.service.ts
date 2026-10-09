import { Injectable } from '@nestjs/common';
import { Purchase } from '../types';
import { randomBytes } from 'crypto';

@Injectable()
export class PurchasesService {
  private purchases: Map<string, Purchase> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const seeds: Purchase[] = [
      {
        id: 'pur-001',
        establishmentId: 'est-004',
        vendedorId: 'seller-1',
        data: new Date('2026-09-22'),
        valor: 450.00,
        autonoma: false,
        createdAt: new Date('2026-09-22'),
      },
      {
        id: 'pur-002',
        establishmentId: 'est-004',
        vendedorId: 'seller-1',
        data: new Date('2026-10-01'),
        valor: 520.00,
        autonoma: true,
        createdAt: new Date('2026-10-01'),
      },
      {
        id: 'pur-003',
        establishmentId: 'est-006',
        vendedorId: 'seller-1',
        data: new Date('2026-08-20'),
        valor: 200.00,
        autonoma: false,
        createdAt: new Date('2026-08-20'),
      },
      {
        id: 'pur-004',
        establishmentId: 'est-006',
        vendedorId: 'seller-1',
        data: new Date('2026-09-05'),
        valor: 250.00,
        autonoma: true,
        createdAt: new Date('2026-09-05'),
      },
      {
        id: 'pur-005',
        establishmentId: 'est-006',
        vendedorId: 'seller-1',
        data: new Date('2026-09-28'),
        valor: 280.00,
        autonoma: true,
        createdAt: new Date('2026-09-28'),
      },
    ];

    seeds.forEach((p) => {
      this.purchases.set(p.id, p);
    });
  }

  create(data: Omit<Purchase, 'id' | 'createdAt'>): Purchase {
    const purchase: Purchase = {
      ...data,
      id: `pur-${randomBytes(4).toString('hex')}`,
      createdAt: new Date(),
    };
    this.purchases.set(purchase.id, purchase);
    return purchase;
  }

  findByEstablishmentId(establishmentId: string): Purchase[] {
    return Array.from(this.purchases.values())
      .filter((p) => p.establishmentId === establishmentId)
      .sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  findByVendedorId(vendedorId: string): Purchase[] {
    return Array.from(this.purchases.values())
      .filter((p) => p.vendedorId === vendedorId)
      .sort((a, b) => b.data.getTime() - a.data.getTime());
  }

  findAutonomousByEstablishment(establishmentId: string): Purchase[] {
    return this.findByEstablishmentId(establishmentId).filter((p) => p.autonoma);
  }
}
