import {
  componenteDistancia,
  componenteHorario,
  componenteRecencia,
  haversineKm,
  pontuar,
  PESOS,
} from './scoring';

// 18:00 em Recife = 21:00 UTC
const AGORA_18H = new Date('2026-10-09T21:00:00Z');

describe('scoring', () => {
  it('pesos somam 1', () => {
    const soma = Object.values(PESOS).reduce((a, b) => a + b, 0);
    expect(soma).toBeCloseTo(1);
  });

  describe('componenteHorario', () => {
    it('é neutro (0,5) sem horário cadastrado', () => {
      expect(componenteHorario(null, AGORA_18H)).toBe(0.5);
    });

    it('é 1 dentro de 1h do horário ideal', () => {
      expect(componenteHorario('18:30', AGORA_18H)).toBe(1);
      expect(componenteHorario('17:00', AGORA_18H)).toBe(1);
    });

    it('é 0 a 3h ou mais de distância', () => {
      expect(componenteHorario('10:00', AGORA_18H)).toBe(0);
    });

    it('decai linearmente entre 1h e 3h', () => {
      // 2h de distância (16:00) → meio caminho
      expect(componenteHorario('16:00', AGORA_18H)).toBeCloseTo(0.5);
    });
  });

  describe('haversineKm', () => {
    it('calcula distância conhecida (São Paulo–Rio ≈ 361 km em linha reta)', () => {
      const saoPaulo = { lat: -23.5505, lng: -46.6333 };
      const rio = { lat: -22.9068, lng: -43.1729 };
      expect(haversineKm(saoPaulo, rio)).toBeGreaterThan(355);
      expect(haversineKm(saoPaulo, rio)).toBeLessThan(365);
    });

    it('é zero para o mesmo ponto', () => {
      const p = { lat: -8.2, lng: -34.9 };
      expect(haversineKm(p, p)).toBeCloseTo(0);
    });
  });

  describe('componenteDistancia', () => {
    it('é neutro (0,5) sem coordenadas', () => {
      expect(componenteDistancia(null)).toBe(0.5);
    });

    it('é 1 até 0,5 km e 0 a partir de 8 km', () => {
      expect(componenteDistancia(0.3)).toBe(1);
      expect(componenteDistancia(8)).toBe(0);
    });

    it('decai linearmente entre 0,5 e 8 km', () => {
      expect(componenteDistancia(4.25)).toBeCloseTo(0.5);
    });
  });

  describe('componenteRecencia', () => {
    it('é 1 se nunca visitado', () => {
      expect(componenteRecencia(null)).toBe(1);
    });

    it('é 0 se visitado hoje', () => {
      expect(componenteRecencia(0)).toBe(0);
    });

    it('cresce até 1 na janela de 14 dias', () => {
      expect(componenteRecencia(7)).toBeCloseTo(0.5);
      expect(componenteRecencia(30)).toBe(1);
    });
  });

  describe('pontuar', () => {
    it('recorrência vencida com alto potencial fica acima de lead normal sem histórico', () => {
      const vencido = pontuar(
        { potencial: 'alto', melhorHorario: null, urgencia: 'vencida', diasRestantes: -5, diasDesdeUltimaVisita: 3 },
        AGORA_18H,
      );
      const lead = pontuar(
        { potencial: 'normal', melhorHorario: null, urgencia: null, diasRestantes: null, diasDesdeUltimaVisita: null },
        AGORA_18H,
      );
      expect(vencido.score).toBeGreaterThan(lead.score);
    });

    it('gera motivos legíveis para a tela', () => {
      const r = pontuar(
        { potencial: 'alto', melhorHorario: '18:00', urgencia: 'critica', diasRestantes: 4, diasDesdeUltimaVisita: null },
        AGORA_18H,
      );
      expect(r.motivos).toEqual([
        'recorrência crítica: faltam 4 dias',
        'alto potencial',
        'horário ideal por volta de 18:00',
        'nunca visitado',
      ]);
    });

    it('score fica entre 0 e 1', () => {
      const r = pontuar(
        { potencial: 'alto', melhorHorario: '18:00', urgencia: 'vencida', diasRestantes: -1, diasDesdeUltimaVisita: 30 },
        AGORA_18H,
      );
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    });
  });
});
