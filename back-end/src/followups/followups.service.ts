import { Injectable } from '@nestjs/common';
import { FollowUp } from '../types';
import { EstablishmentsService } from '../establishments/establishments.service';
import { PurchasesService } from '../purchases/purchases.service';

@Injectable()
export class FollowUpsService {
  constructor(
    private establishmentsService: EstablishmentsService,
    private purchasesService: PurchasesService,
  ) {}

  /**
   * Encontra clientes que fizeram a 1ª compra mas não atingiram recorrência (3ª compra).
   * Retorna ordenado por urgência (dias restantes para atingir 45 dias).
   */
  findByVendedor(vendedorId: string): FollowUp[] {
    const ests = this.establishmentsService.findAll({ vendedorId });
    const followups: FollowUp[] = [];

    ests.forEach((est) => {
      const purchases = this.purchasesService.findByEstablishmentId(est.id);
      const autonomousPurchases = purchases.filter((p) => p.autonoma);

      if (purchases.length === 0) {
        return; // Sem compras, pula
      }

      const primeiraCompra = purchases[purchases.length - 1]; // Última é a primeira cronologicamente
      const proximoDeadline = new Date(primeiraCompra.data);
      proximoDeadline.setDate(proximoDeadline.getDate() + 45);

      const agora = new Date();
      const diasRestantes = Math.ceil(
        (proximoDeadline.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24),
      );

      let urgencia: 'vencida' | 'critica' | 'normal';
      if (diasRestantes < 0) {
        urgencia = 'vencida';
      } else if (diasRestantes <= 7) {
        urgencia = 'critica';
      } else {
        urgencia = 'normal';
      }

      const followup: FollowUp = {
        establishmentId: est.id,
        vendedorId,
        primeiraCompraData: primeiraCompra.data,
        ultimaCompraData: purchases[0].data,
        proximoDeadline,
        comprasAte: autonomousPurchases.length,
        faltam: Math.max(0, 3 - autonomousPurchases.length),
        diasRestantes,
        urgencia,
      };

      if (followup.faltam > 0) {
        followups.push(followup);
      }
    });

    // Ordena por urgência (vencida > crítica > normal) e depois por dias restantes
    return followups.sort((a, b) => {
      const urgenciaOrder = { vencida: 0, critica: 1, normal: 2 };
      if (urgenciaOrder[a.urgencia] !== urgenciaOrder[b.urgencia]) {
        return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia];
      }
      return a.diasRestantes - b.diasRestantes;
    });
  }

  /**
   * Retorna um followup específico
   */
  findByEstablishment(establishmentId: string): FollowUp | undefined {
    const est = this.establishmentsService.findById(establishmentId);
    if (!est) return undefined;

    const purchases = this.purchasesService.findByEstablishmentId(establishmentId);
    if (purchases.length === 0) return undefined;

    const autonomousPurchases = purchases.filter((p) => p.autonoma);
    if (autonomousPurchases.length >= 3) return undefined; // Já atingiu recorrência

    const primeiraCompra = purchases[purchases.length - 1];
    const proximoDeadline = new Date(primeiraCompra.data);
    proximoDeadline.setDate(proximoDeadline.getDate() + 45);

    const agora = new Date();
    const diasRestantes = Math.ceil(
      (proximoDeadline.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24),
    );

    let urgencia: 'vencida' | 'critica' | 'normal';
    if (diasRestantes < 0) {
      urgencia = 'vencida';
    } else if (diasRestantes <= 7) {
      urgencia = 'critica';
    } else {
      urgencia = 'normal';
    }

    return {
      establishmentId,
      vendedorId: est.id, // Hack: não temos info de qual vendedor, retorna est.id
      primeiraCompraData: primeiraCompra.data,
      ultimaCompraData: purchases[0].data,
      proximoDeadline,
      comprasAte: autonomousPurchases.length,
      faltam: Math.max(0, 3 - autonomousPurchases.length),
      diasRestantes,
      urgencia,
    };
  }
}
