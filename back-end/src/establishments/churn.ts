import type { PrismaService } from '../prisma/prisma.service';

/** Cliente que passa esse tempo sem comprar vira churn (definição do case). */
export const DIAS_PARA_CHURN = 120;
const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Ids dos clientes cuja última compra é mais antiga que o limite. Clientes sem nenhuma compra
 * registrada não entram: não há base para dizer que deixaram de comprar.
 */
export function clientesEmChurn(
  clientes: { id: string; ultimaCompra: Date | null }[],
  agora: Date,
): string[] {
  const limite = agora.getTime() - DIAS_PARA_CHURN * DIA_MS;
  return clientes
    .filter((c) => c.ultimaCompra !== null && c.ultimaCompra.getTime() < limite)
    .map((c) => c.id);
}

/**
 * Marca como churn os clientes sem compra há mais de DIAS_PARA_CHURN dias.
 * É idempotente: rodar de novo não muda nada além do que já está vencido.
 */
export async function aplicarChurn(prisma: PrismaService, agora: Date = new Date()): Promise<number> {
  const clientes = await prisma.establishment.findMany({
    where: { status: 'cliente' },
    select: { id: true },
  });
  if (clientes.length === 0) return 0;

  const ultimas = await prisma.purchase.groupBy({
    by: ['establishmentId'],
    where: { establishmentId: { in: clientes.map((c) => c.id) } },
    _max: { data: true },
  });
  const ultimaPorEst = new Map(ultimas.map((u) => [u.establishmentId, u._max.data]));

  const ids = clientesEmChurn(
    clientes.map((c) => ({ id: c.id, ultimaCompra: ultimaPorEst.get(c.id) ?? null })),
    agora,
  );
  if (ids.length === 0) return 0;

  await prisma.establishment.updateMany({ where: { id: { in: ids } }, data: { status: 'churn' } });
  return ids.length;
}
