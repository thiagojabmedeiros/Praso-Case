// Conversão entre as linhas do Prisma e os tipos de src/types (formato da API).
import type {
  Establishment as EstablishmentRow,
  Purchase as PurchaseRow,
  Seller as SellerRow,
  Visit as VisitRow,
} from '../generated/prisma/client';
import type {
  DocumentType,
  Establishment,
  Purchase,
  Seller,
  Visit,
  VisitResult,
} from '../types';

// Enum do banco usa NAO_MEI e em_acompanhamento; a API usa nao-MEI e em-acompanhamento.
export function docToDb(tipo: DocumentType | null | undefined) {
  if (tipo === undefined) return undefined;
  if (tipo === null) return null;
  return tipo === 'nao-MEI' ? 'NAO_MEI' : 'MEI';
}

export function docFromDb(tipo: EstablishmentRow['tipoDoc']): DocumentType | null {
  if (tipo === null) return null;
  return tipo === 'NAO_MEI' ? 'nao-MEI' : 'MEI';
}

export function resultToDb(resultado: VisitResult) {
  return resultado === 'em-acompanhamento' ? 'em_acompanhamento' : resultado;
}

export function resultFromDb(resultado: VisitRow['resultado']): VisitResult {
  return resultado === 'em_acompanhamento' ? 'em-acompanhamento' : resultado;
}

export function toEstablishment(row: EstablishmentRow): Establishment {
  return {
    ...row,
    tipoDoc: docFromDb(row.tipoDoc),
  };
}

export function toVisit(row: VisitRow): Visit {
  const hasGeo = row.geoLat !== null && row.geoLng !== null;
  return {
    id: row.id,
    establishmentId: row.establishmentId,
    vendedorId: row.vendedorId,
    dataHora: row.dataHora,
    tipo: row.tipo,
    resultado: resultFromDb(row.resultado),
    geo: hasGeo
      ? {
          lat: row.geoLat as number,
          lng: row.geoLng as number,
          accuracy: row.geoAccuracy ?? undefined,
        }
      : undefined,
    nota: row.nota,
    proximoContato: row.proximoContato,
    createdAt: row.createdAt,
  };
}

export function toPurchase(row: PurchaseRow): Purchase {
  return {
    id: row.id,
    establishmentId: row.establishmentId,
    vendedorId: row.vendedorId,
    data: row.data,
    valor: Number(row.valor),
    autonoma: row.autonoma,
    createdAt: row.createdAt,
  };
}

export function toSeller(row: SellerRow): Seller {
  return {
    id: row.id,
    nome: row.nome,
    pontuacaoAcumulada: row.pontuacaoAcumulada,
    createdAt: row.createdAt,
  };
}
