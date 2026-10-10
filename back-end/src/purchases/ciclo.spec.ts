import { cicloAtual, fimDaJanela } from './ciclo';

const d = (iso: string) => new Date(iso);

describe('cicloAtual', () => {
  it('a janela começa na 1ª compra e tem 45 dias', () => {
    const c = cicloAtual([{ data: d('2026-08-20'), autonoma: false }]);
    expect(c.inicio).toEqual(d('2026-08-20'));
    expect(fimDaJanela(c.inicio)).toEqual(d('2026-10-04'));
  });

  it('compra depois do vencimento abre um novo ciclo com novo prazo', () => {
    const c = cicloAtual([
      { data: d('2026-08-20'), autonoma: false },
      { data: d('2026-09-02'), autonoma: true },
      { data: d('2026-10-10'), autonoma: true },
    ]);
    expect(c.inicio).toEqual(d('2026-10-10'));
    expect(c.autonomasCiclo).toBe(1);
    expect(fimDaJanela(c.inicio)).toEqual(d('2026-11-24'));
  });

  it('3 compras autônomas dentro da mesma janela batem a meta', () => {
    const c = cicloAtual([
      { data: d('2026-09-01'), autonoma: false },
      { data: d('2026-09-05'), autonoma: true },
      { data: d('2026-09-10'), autonoma: true },
      { data: d('2026-09-20'), autonoma: true },
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
