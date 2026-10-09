import { FollowUp, Potential } from '../types';

// Pesos da pontuação (soma = 1). Primeira aposta; ajustar com os dados de campo.
export const PESOS = {
  urgencia: 0.3,
  potencial: 0.2,
  horario: 0.2,
  recencia: 0.15,
  distancia: 0.15,
} as const;

// Distância em linha reta: 0,5 km ou menos vale 1; 8 km ou mais vale 0.
const DISTANCIA_CHEIA_KM = 0.5;
const DISTANCIA_ZERO_KM = 8;
const RAIO_TERRA_KM = 6371;

/** Distância em linha reta entre dois pontos (fórmula de haversine), em km. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (graus: number) => (graus * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(h));
}

/** 0,5 quando não há coordenadas (neutro). */
export function componenteDistancia(distanciaKm: number | null): number {
  if (distanciaKm === null) return 0.5;
  if (distanciaKm <= DISTANCIA_CHEIA_KM) return 1;
  if (distanciaKm >= DISTANCIA_ZERO_KM) return 0;
  return 1 - (distanciaKm - DISTANCIA_CHEIA_KM) / (DISTANCIA_ZERO_KM - DISTANCIA_CHEIA_KM);
}

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
  distanciaKm?: number | null; // null: sem coordenadas (neutro)
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
  const distancia = componenteDistancia(input.distanciaKm ?? null);

  const score =
    PESOS.urgencia * urgencia +
    PESOS.potencial * potencial +
    PESOS.horario * horario +
    PESOS.recencia * recencia +
    PESOS.distancia * distancia;

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

  if (input.distanciaKm !== undefined && input.distanciaKm !== null) {
    motivos.push(`a ${input.distanciaKm.toFixed(1)} km de você`);
  }

  if (input.diasDesdeUltimaVisita === null) {
    motivos.push('nunca visitado');
  } else if (input.diasDesdeUltimaVisita >= JANELA_RECENCIA_DIAS) {
    motivos.push(`sem visita há ${input.diasDesdeUltimaVisita} dias`);
  }

  return { score: Math.round(score * 1000) / 1000, motivos };
}
