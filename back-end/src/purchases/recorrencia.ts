import type { Prisma } from '../generated/prisma/client';
import { COMPRAS_PARA_RECORRENCIA, cicloAtual } from './ciclo';

export const PONTOS_RECORRENCIA = 3;

/**
 * Chamar logo após registrar uma compra autônoma.
 * Quando o ciclo atual do estabelecimento chega à 3ª compra autônoma, o vendedor ganha os
 * pontos de recorrência. Só dá pontos no momento exato em que a 3ª compra do ciclo é registrada.
 */
export async function registrarRecorrencia(
  tx: Prisma.TransactionClient,
  establishmentId: string,
  vendedorId: string,
): Promise<number> {
  const compras = await tx.purchase.findMany({
    where: { establishmentId },
    orderBy: { data: 'asc' },
    select: { data: true, autonoma: true },
  });
  const { autonomasCiclo } = cicloAtual(compras);
  if (autonomasCiclo !== COMPRAS_PARA_RECORRENCIA) return 0;

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
