export type EstablishmentStatus = 'lead' | 'oportunidade' | 'cliente' | 'churn';
export type EstablishmentSegment = 'restaurante' | 'padaria' | 'lanchonete' | 'pizzaria' | 'hamburgueria' | 'cafeteria' | 'bar';
export type DocumentType = 'MEI' | 'nao-MEI';
export type Potential = 'alto' | 'normal' | 'baixo';
export type VisitType = 'planejada' | 'efetiva';
export type Turno = 'manha' | 'tarde' | 'noite';
export type VisitResult = 'cadastrou' | 'recusou' | 'fechado' | 'ausente' | 'compra' | 'em-acompanhamento';

export interface Geo {
  lat: number;
  lng: number;
  accuracy?: number;
}

// Campos nulos são dados ainda não levantados (ver prisma/seed.ts).
export interface Establishment {
  id: string;
  razaoSocial: string | null;
  nomeFantasia: string;
  cnpj: string | null;
  segmento: EstablishmentSegment;
  tipoDoc: DocumentType | null;
  potencial: Potential;
  status: EstablishmentStatus;
  endereco: string;
  telefone: string | null;
  bairro: string;
  melhorHorario: string | null; // ex: "14:00"
  melhorTurno: Turno | null; // último turno informado pelo vendedor
  notasContexto: string;
  score: number;
  vendedorId: string | null;
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
  proximoContato?: Date | null;
  melhorTurno?: Turno | null;
  pontosGerados?: number;
  anuladaEm?: Date | null;
  motivoAnulacao?: string | null;
  createdAt: Date;
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
  metaBatida: boolean; // 3 compras autônomas: cliente recorrente, sai da prioridade
  proximaPendencia: Date | null; // venda + 15 dias, ou data de retorno combinada na última visita
}
