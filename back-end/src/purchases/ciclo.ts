export const JANELA_DIAS = 15; // prazo renovado a cada venda
export const COMPRAS_PARA_RECORRENCIA = 3;

export interface CompraCiclo {
  data: Date;
  autonoma: boolean;
}

export function fimDaJanela(inicio: Date): Date {
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + JANELA_DIAS);
  return fim;
}

/**
 * Divide as compras em ciclos. Cada venda renova a janela de 15 dias: a próxima venda precisa
 * acontecer até 15 dias depois da última. Se o intervalo passar disso, um novo ciclo começa na
 * venda seguinte. Se algum ciclo chegou a 3 compras autônomas, a meta foi batida.
 * `comprasAsc` deve vir da mais antiga para a mais recente.
 */
export function cicloAtual(comprasAsc: CompraCiclo[]) {
  let inicio = comprasAsc[0].data;
  let ultima = inicio;
  let autonomasCiclo = 0;
  let metaAlcancada = false;

  for (const p of comprasAsc) {
    if (p.data > fimDaJanela(ultima)) {
      if (autonomasCiclo >= COMPRAS_PARA_RECORRENCIA) metaAlcancada = true;
      inicio = p.data;
      autonomasCiclo = 0;
    }
    if (p.autonoma) autonomasCiclo++;
    ultima = p.data;
  }
  if (autonomasCiclo >= COMPRAS_PARA_RECORRENCIA) metaAlcancada = true;

  return { inicio, ultima, autonomasCiclo, metaAlcancada };
}

/** Meta de recorrência batida em algum ciclo: o cliente não recebe mais visitas nem compras. */
export function metaBatidaPorCompras(comprasAsc: CompraCiclo[]): boolean {
  return comprasAsc.length > 0 && cicloAtual(comprasAsc).metaAlcancada;
}

export const MENSAGEM_META_BATIDA = 'Cliente já bateu a meta de recorrência: visitas e compras estão bloqueadas';
