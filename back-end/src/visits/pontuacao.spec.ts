import { pontosDeAquisicao } from './pontuacao';

describe('pontosDeAquisicao', () => {
  it('alto potencial vale 3, independente do tipo de documento', () => {
    expect(pontosDeAquisicao('alto', 'MEI')).toBe(3);
    expect(pontosDeAquisicao('alto', 'nao-MEI')).toBe(3);
  });

  it('MEI vale 0,5', () => {
    expect(pontosDeAquisicao('normal', 'MEI')).toBe(0.5);
  });

  it('Não-MEI vale 1', () => {
    expect(pontosDeAquisicao('normal', 'nao-MEI')).toBe(1);
  });

  it('sem tipo de documento conhecido, usa 1', () => {
    expect(pontosDeAquisicao('baixo', null)).toBe(1);
  });
});
