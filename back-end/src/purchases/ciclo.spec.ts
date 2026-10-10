import { cicloAtual, fimDaJanela } from './ciclo';

const d = (iso: string) => new Date(iso);

describe('cicloAtual (janela de 15 dias renovada a cada venda)', () => {
  it('o prazo é 15 dias depois da última venda', () => {
    const c = cicloAtual([
      { data: d('2026-09-01'), autonoma: false },
      { data: d('2026-09-10'), autonoma: true },
    ]);
    expect(fimDaJanela(c.ultima)).toEqual(d('2026-09-25'));
  });

  it('cada venda dentro do prazo renova a janela', () => {
    const c = cicloAtual([
      { data: d('2026-09-01'), autonoma: false },
      { data: d('2026-09-12'), autonoma: true },
      { data: d('2026-09-24'), autonoma: true },
    ]);
    expect(c.inicio).toEqual(d('2026-09-01'));
    expect(fimDaJanela(c.ultima)).toEqual(d('2026-10-09'));
  });

  it('intervalo maior que 15 dias abre um novo ciclo', () => {
    const c = cicloAtual([
      { data: d('2026-08-20'), autonoma: false },
      { data: d('2026-09-02'), autonoma: true },
      { data: d('2026-10-10'), autonoma: true },
    ]);
    expect(c.inicio).toEqual(d('2026-10-10'));
    expect(c.autonomasCiclo).toBe(1);
  });

  it('3 compras autônomas com intervalos de até 15 dias batem a meta', () => {
    const c = cicloAtual([
      { data: d('2026-09-01'), autonoma: false },
      { data: d('2026-09-05'), autonoma: true },
      { data: d('2026-09-15'), autonoma: true },
      { data: d('2026-09-28'), autonoma: true },
    ]);
    expect(c.metaAlcancada).toBe(true);
  });

  it('meta batida em um ciclo continua valendo depois que outro ciclo começa', () => {
    const c = cicloAtual([
      { data: d('2026-08-01'), autonoma: true },
      { data: d('2026-08-05'), autonoma: true },
      { data: d('2026-08-10'), autonoma: true },
      { data: d('2026-10-20'), autonoma: false },
    ]);
    expect(c.metaAlcancada).toBe(true);
  });
});
