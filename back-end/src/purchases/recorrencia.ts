import type { Prisma } from '../generated/prisma/client';

export const COMPRAS_PARA_RECORRENCIA = 3;
export const PONTOS_RECORRENCIA = 3;

/**
 * Chamar logo após registrar uma compra autônoma.
 * Quando o estabelecimento chega à 3ª compra autônoma, o vendedor ganha os pontos de recorrência.
 * Só dá pontos no momento exato em que a 3ª compra é registrada, então não repete.
 */
export async function registrarRecorrencia(
  tx: Prisma.TransactionClient,
  establishmentId: string,
  vendedorId: string,
): Promise<number> {
  const autonomas = await tx.purchase.count({
    where: { establishmentId, autonoma: true },
  });
  if (autonomas !== COMPRAS_PARA_RECORRENCIA) return 0;

  await tx.establishment.update({
    where: { id: establishmentId },
    data: { score: { increment: PONTOS_RECORRENCIA } },
  });
  await tx.seller.update({
    where: { id: vendedorId },
    data: { pontuacaoAcumulada: { increment: PONTOS_RECORRENCIA } },
  });
  return PONTOS_RECORRENCIA;
}
