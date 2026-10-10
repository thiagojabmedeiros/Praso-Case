import { EstablishmentStatus, FollowUp, Potential, Turno } from '../types';

// Pesos da pontuação (soma = 1). Primeira aposta; ajustar com os dados de campo.
export const PESOS = {
  urgencia: 0.2,
  potencial: 0.15,
  horario: 0.15,
  recencia: 0.1,
  distancia: 0.15,
  cadastro: 0.15,
  retorno: 0.1,
} as const;

// Quanto o estabelecimento já está ligado à Praso. Cliente já compra; oportunidade já
// se cadastrou; churn já foi cliente; lead nunca se cadastrou.
const CADASTRO: Record<EstablishmentStatus, number> = {
  cliente: 1,
  oportunidade: 0.5,
  churn: 0.5,
  lead: 0,
};

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

// Turno em que o vendedor está, quando não há horário exato cadastrado.
const TURNO_FORA = 0.2;

const TURNO_LABEL: Record<Turno, string> = {
  manha: 'manhã',
  tarde: 'tarde',
  noite: 'noite',
};

// Praia de Candeias/Piedade fica em Recife (UTC-3, sem horário de verão).
const OFFSET_RECIFE_HORAS = 3;
const DIA_MS = 24 * 60 * 60 * 1000;

export interface ScoreInput {
  status: EstablishmentStatus;
  potencial: Potential;
  melhorHorario: string | null;
  melhorTurno?: Turno | null; // usado quando não há horário exato
  urgencia: FollowUp['urgencia'] | null; // null: fora da carteira de recorrência
  diasRestantes: number | null;
  diasDesdeUltimaVisita: number | null; // null: nunca visitado
  distanciaKm?: number | null; // null: sem coordenadas (neutro)
  retornoData?: string | null; // data combinada do próximo contato, AAAA-MM-DD (horário de Recife)
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

/** Turno atual em Recife: manhã 6h–11h59, tarde 12h–17h59, noite no restante. */
export function turnoAtual(agora: Date): Turno {
  const h = (agora.getUTCHours() - OFFSET_RECIFE_HORAS + 24) % 24;
  if (h >= 6 && h < 12) return 'manha';
  if (h >= 12 && h < 18) return 'tarde';
  return 'noite';
}

/** Data de Recife no formato AAAA-MM-DD. */
export function dataRecife(agora: Date): string {
  return new Date(agora.getTime() - OFFSET_RECIFE_HORAS * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Horário exato tem prioridade: dentro de 1h do horário ideal vale 1.
 * Sem horário exato, o turno decide: no turno ideal vale 1, fora dele vale 0,2.
 * Sem nenhum dos dois, 0,5 (neutro).
 */
export function componenteHorario(melhorHorario: string | null, agora: Date, melhorTurno: Turno | null = null): number {
  if (melhorHorario) {
    const distancia = Math.abs(minutosDoDia(agora) - minutosDeHorario(melhorHorario));
    if (distancia <= HORARIO_CHEIO_MIN) return 1;
    if (distancia >= HORARIO_ZERO_MIN) return 0;
    return 1 - (distancia - HORARIO_CHEIO_MIN) / (HORARIO_ZERO_MIN - HORARIO_CHEIO_MIN);
  }
  if (melhorTurno) return turnoAtual(agora) === melhorTurno ? 1 : TURNO_FORA;
  return 0.5;
}

/** Nunca visitado vale 1; visitado hoje vale 0; cresce linearmente até a janela. */
export function componenteRecencia(diasDesdeUltimaVisita: number | null): number {
  if (diasDesdeUltimaVisita === null) return 1;
  if (diasDesdeUltimaVisita <= 0) return 0;
  return Math.min(diasDesdeUltimaVisita / JANELA_RECENCIA_DIAS, 1);
}

/** Retorno combinado para hoje ou já vencido vale 1; retorno futuro ou inexistente vale 0. */
export function componenteRetorno(retornoData: string | null | undefined, agora: Date): number {
  if (!retornoData) return 0;
  return retornoData <= dataRecife(agora) ? 1 : 0;
}

function diasEntre(anterior: string, posterior: string): number {
  return Math.round((Date.parse(posterior) - Date.parse(anterior)) / DIA_MS);
}

export function pontuar(input: ScoreInput, agora: Date): ScoreResult {
  const urgencia = input.urgencia ? URGENCIA[input.urgencia] : 0;
  const potencial = POTENCIAL[input.potencial];
  const melhorTurno = input.melhorTurno ?? null;
  const horario = componenteHorario(input.melhorHorario, agora, melhorTurno);
  const recencia = componenteRecencia(input.diasDesdeUltimaVisita);
  const distancia = componenteDistancia(input.distanciaKm ?? null);
  const cadastro = CADASTRO[input.status];
  const retorno = componenteRetorno(input.retornoData, agora);

  const score =
    PESOS.urgencia * urgencia +
    PESOS.potencial * potencial +
    PESOS.horario * horario +
    PESOS.recencia * recencia +
    PESOS.distancia * distancia +
    PESOS.cadastro * cadastro +
    PESOS.retorno * retorno;

  const motivos: string[] = [];

  if (input.urgencia === 'vencida') {
    motivos.push(`recorrência vencida há ${Math.abs(input.diasRestantes ?? 0)} dias`);
  } else if (input.urgencia === 'critica') {
    motivos.push(`recorrência crítica: faltam ${input.diasRestantes ?? 0} dias`);
  } else if (input.urgencia === 'normal') {
    motivos.push(`em acompanhamento de recorrência`);
  }

  if (retorno === 1 && input.retornoData) {
    const hoje = dataRecife(agora);
    const atraso = diasEntre(input.retornoData, hoje);
    motivos.push(atraso === 0 ? 'retorno combinado para hoje' : `retorno combinado há ${atraso} dias`);
  }

  if (input.potencial === 'alto') motivos.push('alto potencial');

  if (input.status === 'cliente') motivos.push('cliente na Praso');
  else if (input.status === 'oportunidade') motivos.push('já cadastrado, ainda não comprou');

  if (input.melhorHorario && horario >= 0.5) {
    motivos.push(`horário ideal por volta de ${input.melhorHorario}`);
  } else if (!input.melhorHorario && melhorTurno && turnoAtual(agora) === melhorTurno) {
    motivos.push(`melhor turno: ${TURNO_LABEL[melhorTurno]}`);
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
