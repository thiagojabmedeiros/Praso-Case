export type EstablishmentStatus = 'lead' | 'oportunidade' | 'cliente' | 'churn';
export type EstablishmentSegment = 'restaurante' | 'padaria' | 'lanchonete' | 'pizzaria' | 'hamburgueria' | 'cafeteria' | 'bar';
export type DocumentType = 'MEI' | 'nao-MEI';
export type Potential = 'alto' | 'normal';
export type VisitType = 'planejada' | 'efetiva';
export type VisitResult = 'cadastrou' | 'recusou' | 'fechado' | 'ausente' | 'compra' | 'em-acompanhamento';

export interface Geo {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface Establishment {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  segmento: EstablishmentSegment;
  tipoDoc: DocumentType;
  potencial: Potential;
  status: EstablishmentStatus;
  endereco: string;
  bairro: string;
  fornecedorAtual: string;
  melhorHorario: string; // ex: "14:00"
  notasContexto: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visit {
  id: string;
  establishmentId: string;
  vendedorId: string;
  dataHora: Date;
  tipo: VisitType;
  resultado: VisitResult;
  geo?: Geo;
  nota: string;
  createdAt: Date;
  updatedAt?: never; // imutável
}

export interface Purchase {
  id: string;
  establishmentId: string;
  vendedorId: string;
  data: Date;
  valor: number;
  autonoma: boolean;
  createdAt: Date;
}

export interface Seller {
  id: string;
  nome: string;
  pontuacaoAcumulada: number;
  createdAt: Date;
}

export interface FollowUp {
  establishmentId: string;
  vendedorId: string;
  primeiraCompraData: Date;
  ultimaCompraData: Date;
  proximoDeadline: Date; // 45 dias da 1ª compra
  comprasAte: number; // quantas compras autonomas já fez
  faltam: number; // 3 - comprasAte
  diasRestantes: number;
  urgencia: 'vencida' | 'critica' | 'normal'; // calculado
}
