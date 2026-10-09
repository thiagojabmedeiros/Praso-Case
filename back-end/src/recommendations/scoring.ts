import { FollowUp, Potential } from '../types';

// Pesos da pontuação (soma = 1). Primeira aposta; ajustar com os dados de campo.
export const PESOS = {
  urgencia: 0.35,
  potencial: 0.25,
  horario: 0.2,
  recencia: 0.2,
} as const;

const URGENCIA: Record<FollowUp['urgencia'], number> = {
  vencida: 1,
  critica: 0.8,
  normal: 0.5,
};

const POTENCIAL: Record<Potential, number> = {
  alto: 1,
  normal: 0.5,
  baixo: 0.2,
};

// Dias sem visita para a recência chegar ao máximo.
const JANELA_RECENCIA_DIAS = 14;

// Janela do horário ideal: dentro de 1h o componente é 1; some em 3h de distância.
const HORARIO_CHEIO_MIN = 60;
const HORARIO_ZERO_MIN = 180;

// Praia de Candeias/Piedade fica em Recife (UTC-3, sem horário de verão).
const OFFSET_RECIFE_HORAS = 3;

export interface ScoreInput {
  potencial: Potential;
  melhorHorario: string | null;
  urgencia: FollowUp['urgencia'] | null; // null: fora da carteira de recorrência
  diasRestantes: number | null;
  diasDesdeUltimaVisita: number | null; // null: nunca visitado
}

export interface ScoreResult {
  score: number;
  motivos: string[];
}

function minutosDoDia(agora: Date): number {
  const h = (agora.getUTCHours() - OFFSET_RECIFE_HORAS + 24) % 24;
  return h * 60 + agora.getUTCMinutes();
}

function minutosDeHorario(horario: string): number {
  const [h, m] = horario.split(':').map(Number);
  return h * 60 + m;
}

/** 0,5 quando não há horário cadastrado (neutro). */
export function componenteHorario(melhorHorario: string | null, agora: Date): number {
  if (!melhorHorario) return 0.5;
  const distancia = Math.abs(minutosDoDia(agora) - minutosDeHorario(melhorHorario));
  if (distancia <= HORARIO_CHEIO_MIN) return 1;
  if (distancia >= HORARIO_ZERO_MIN) return 0;
  return 1 - (distancia - HORARIO_CHEIO_MIN) / (HORARIO_ZERO_MIN - HORARIO_CHEIO_MIN);
}

/** Nunca visitado vale 1; visitado hoje vale 0; cresce linearmente até a janela. */
export function componenteRecencia(diasDesdeUltimaVisita: number | null): number {
  if (diasDesdeUltimaVisita === null) return 1;
  if (diasDesdeUltimaVisita <= 0) return 0;
  return Math.min(diasDesdeUltimaVisita / JANELA_RECENCIA_DIAS, 1);
}

export function pontuar(input: ScoreInput, agora: Date): ScoreResult {
  const urgencia = input.urgencia ? URGENCIA[input.urgencia] : 0;
  const potencial = POTENCIAL[input.potencial];
  const horario = componenteHorario(input.melhorHorario, agora);
  const recencia = componenteRecencia(input.diasDesdeUltimaVisita);

  const score =
    PESOS.urgencia * urgencia +
    PESOS.potencial * potencial +
    PESOS.horario * horario +
    PESOS.recencia * recencia;

  const motivos: string[] = [];

  if (input.urgencia === 'vencida') {
    motivos.push(`recorrência vencida há ${Math.abs(input.diasRestantes ?? 0)} dias`);
  } else if (input.urgencia === 'critica') {
    motivos.push(`recorrência crítica: faltam ${input.diasRestantes ?? 0} dias`);
  } else if (input.urgencia === 'normal') {
    motivos.push(`em acompanhamento de recorrência`);
  }

  if (input.potencial === 'alto') motivos.push('alto potencial');

  if (input.melhorHorario && horario >= 0.5) {
    motivos.push(`horário ideal por volta de ${input.melhorHorario}`);
  }

  if (input.diasDesdeUltimaVisita === null) {
    motivos.push('nunca visitado');
  } else if (input.diasDesdeUltimaVisita >= JANELA_RECENCIA_DIAS) {
    motivos.push(`sem visita há ${input.diasDesdeUltimaVisita} dias`);
  }

  return { score: Math.round(score * 1000) / 1000, motivos };
}
