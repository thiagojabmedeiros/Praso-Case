import { DIAS_PARA_CHURN, clientesEmChurn } from './churn';

const DIA_MS = 24 * 60 * 60 * 1000;
const agora = new Date('2026-10-10T12:00:00Z');
const diasAtras = (dias: number) => new Date(agora.getTime() - dias * DIA_MS);

describe('clientesEmChurn', () => {
  it('marca cliente com última compra além de 120 dias', () => {
    const ids = clientesEmChurn([{ id: 'a', ultimaCompra: diasAtras(DIAS_PARA_CHURN + 1) }], agora);
    expect(ids).toEqual(['a']);
  });

  it('não marca cliente dentro do prazo', () => {
    const ids = clientesEmChurn([{ id: 'a', ultimaCompra: diasAtras(DIAS_PARA_CHURN - 1) }], agora);
    expect(ids).toEqual([]);
  });

  it('não marca cliente sem nenhuma compra registrada', () => {
    const ids = clientesEmChurn([{ id: 'a', ultimaCompra: null }], agora);
    expect(ids).toEqual([]);
  });

  it('separa só os vencidos entre vários clientes', () => {
    const ids = clientesEmChurn(
      [
        { id: 'antigo', ultimaCompra: diasAtras(200) },
        { id: 'recente', ultimaCompra: diasAtras(10) },
        { id: 'sem-compra', ultimaCompra: null },
      ],
      agora,
    );
    expect(ids).toEqual(['antigo']);
  });
});
