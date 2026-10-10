export type EstablishmentStatus = 'lead' | 'oportunidade' | 'cliente' | 'churn';
export type EstablishmentSegment = 'restaurante' | 'padaria' | 'lanchonete' | 'pizzaria' | 'hamburgueria' | 'cafeteria' | 'bar';
export type DocumentType = 'MEI' | 'nao-MEI';
export type Potential = 'alto' | 'normal' | 'baixo';
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
  telefone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bairro: string;
  fornecedorAtual: string;
  melhorHorario: string;
  notasContexto: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  establishmentId: string;
  vendedorId: string;
  dataHora: string;
  tipo: VisitType;
  resultado: VisitResult;
  geo?: Geo;
  nota: string;
  proximoContato?: string | null;
  createdAt: string;
}

export interface Purchase {
  id: string;
  establishmentId: string;
  vendedorId: string;
  data: string;
  valor: number;
  autonoma: boolean;
  createdAt: string;
}

export interface FollowUp {
  establishmentId: string;
  vendedorId: string;
  primeiraCompraData: string;
  ultimaCompraData: string;
  proximoDeadline: string;
  comprasAte: number;
  faltam: number;
  diasRestantes: number;
  urgencia: 'vencida' | 'critica' | 'normal';
}

export interface Seller {
  id: string;
  nome: string;
  pontuacaoAcumulada: number;
  createdAt: string;
}

export interface Recomendacao {
  establishment: Establishment;
  score: number;
  motivos: string[];
}
