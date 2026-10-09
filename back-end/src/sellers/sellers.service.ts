import { Injectable } from '@nestjs/common';
import { Seller } from '../types';

@Injectable()
export class SellersService {
  private sellers: Map<string, Seller> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const seeds: Seller[] = [
      {
        id: 'seller-1',
        nome: 'João da Silva',
        pontuacaoAcumulada: 1.5,
        createdAt: new Date('2026-08-01'),
      },
      {
        id: 'seller-2',
        nome: 'Maria dos Santos',
        pontuacaoAcumulada: 0.5,
        createdAt: new Date('2026-08-15'),
      },
    ];

    seeds.forEach((s) => {
      this.sellers.set(s.id, s);
    });
  }

  findById(id: string): Seller | undefined {
    return this.sellers.get(id);
  }

  findAll(): Seller[] {
    return Array.from(this.sellers.values()).sort(
      (a, b) => b.pontuacaoAcumulada - a.pontuacaoAcumulada,
    );
  }

  updateScore(id: string, pontos: number): Seller | undefined {
    const seller = this.sellers.get(id);
    if (!seller) return undefined;
    seller.pontuacaoAcumulada += pontos;
    return seller;
  }
}
