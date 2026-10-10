import { Injectable } from '@nestjs/common';
import { FollowUp, Purchase } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { toPurchase } from '../prisma/mappers';

const JANELA_DIAS = 45;
const COMPRAS_PARA_RECORRENCIA = 3;

/**
 * Calcula o acompanhamento de um estabelecimento a partir das suas compras.
 * `purchases` deve vir ordenado por data, da mais recente para a mais antiga.
 * Retorna undefined se não houve compra ou se o cliente já atingiu a recorrência.
 */
function buildFollowUp(
  establishmentId: string,
  vendedorId: string,
  purchases: Purchase[],
  agora: Date,
): FollowUp | undefined {
  if (purchases.length === 0) return undefined;

  const autonomas = purchases.filter((p) => p.autonoma).length;

  const primeiraCompra = purchases[purchases.length - 1];
  const proximoDeadline = new Date(primeiraCompra.data);
  proximoDeadline.setDate(proximoDeadline.getDate() + JANELA_DIAS);

  const diasRestantes = Math.ceil(
    (proximoDeadline.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24),
  );

  let urgencia: FollowUp['urgencia'];
  if (diasRestantes < 0) {
    urgencia = 'vencida';
  } else if (diasRestantes <= 7) {
    urgencia = 'critica';
  } else {
    urgencia = 'normal';
  }

  return {
    establishmentId,
    vendedorId,
    primeiraCompraData: primeiraCompra.data,
    ultimaCompraData: purchases[0].data,
    proximoDeadline,
    comprasAte: autonomas,
    faltam: Math.max(0, COMPRAS_PARA_RECORRENCIA - autonomas),
    diasRestantes,
    urgencia,
    metaBatida: autonomas >= COMPRAS_PARA_RECORRENCIA,
  };
}

@Injectable()
export class FollowUpsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Clientes do vendedor que fizeram a 1ª compra mas ainda não atingiram a recorrência (3ª compra autônoma).
   * Ordenado por urgência e depois por dias restantes.
   */
  async findByVendedor(vendedorId: string): Promise<FollowUp[]> {
    const establishments = await this.prisma.establishment.findMany({
      where: { vendedorId },
      select: { id: true, vendedorId: true },
    });
    const ids = establishments.map((e) => e.id);

    const purchaseRows = await this.prisma.purchase.findMany({
      where: { establishmentId: { in: ids } },
      orderBy: { data: 'desc' },
    });
    const porEstabelecimento = new Map<string, Purchase[]>();
    for (const row of purchaseRows.map(toPurchase)) {
      const lista = porEstabelecimento.get(row.establishmentId) ?? [];
      lista.push(row);
      porEstabelecimento.set(row.establishmentId, lista);
    }

    const agora = new Date();
    const followups = establishments
      .map((est) => buildFollowUp(est.id, vendedorId, porEstabelecimento.get(est.id) ?? [], agora))
      .filter((f): f is FollowUp => f !== undefined);

    const ordemUrgencia = { vencida: 0, critica: 1, normal: 2 };
    // Metas batidas ficam por último: não são mais prioridade.
    return followups.sort((a, b) => {
      if (a.metaBatida !== b.metaBatida) return a.metaBatida ? 1 : -1;
      if (ordemUrgencia[a.urgencia] !== ordemUrgencia[b.urgencia]) {
        return ordemUrgencia[a.urgencia] - ordemUrgencia[b.urgencia];
      }
      return a.diasRestantes - b.diasRestantes;
    });
  }

  /**
   * Acompanhamento de um estabelecimento específico.
   */
  async findByEstablishment(establishmentId: string): Promise<FollowUp | undefined> {
    const est = await this.prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { id: true, vendedorId: true },
    });
    if (!est) return undefined;

    const purchaseRows = await this.prisma.purchase.findMany({
      where: { establishmentId },
      orderBy: { data: 'desc' },
    });
    const purchases = purchaseRows.map(toPurchase);
    const vendedorId = est.vendedorId ?? purchases[0]?.vendedorId ?? '';

    return buildFollowUp(establishmentId, vendedorId, purchases, new Date());
  }
}
