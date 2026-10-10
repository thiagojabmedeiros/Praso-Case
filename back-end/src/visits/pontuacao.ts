import { DocumentType, Potential } from '../types';

/**
 * Pontos que o vendedor ganha ao conquistar um estabelecimento (cadastro).
 * Regra do case: alto potencial vale 3; MEI vale 0,5; Não-MEI vale 1.
 * Sem informação do tipo de documento, usa 1 (Não-MEI).
 */
export function pontosDeAquisicao(potencial: Potential, tipoDoc: DocumentType | null): number {
  if (potencial === 'alto') return 3;
  if (tipoDoc === 'MEI') return 0.5;
  return 1;
}
