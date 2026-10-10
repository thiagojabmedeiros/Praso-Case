export const JANELA_DIAS = 45;
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
 * Divide as compras em ciclos de 45 dias. O ciclo começa na 1ª compra; quando a janela
 * vence, a próxima compra abre um novo ciclo. Assim o prazo é recalculado após uma venda
 * feita depois do vencimento. Se algum ciclo chegou a 3 compras autônomas, a meta foi batida.
 * `comprasAsc` deve vir da mais antiga para a mais recente.
 */
export function cicloAtual(comprasAsc: CompraCiclo[]) {
  let inicio = comprasAsc[0].data;
  let autonomasCiclo = 0;
  let metaAlcancada = false;

  for (const p of comprasAsc) {
    if (p.data > fimDaJanela(inicio)) {
      if (autonomasCiclo >= COMPRAS_PARA_RECORRENCIA) metaAlcancada = true;
      inicio = p.data;
      autonomasCiclo = 0;
    }
    if (p.autonoma) autonomasCiclo++;
  }
  if (autonomasCiclo >= COMPRAS_PARA_RECORRENCIA) metaAlcancada = true;

  return { inicio, autonomasCiclo, metaAlcancada };
}
