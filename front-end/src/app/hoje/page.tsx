'use client';

import { useEffect, useState } from 'react';
import { CalendarX2, Clock, Map as MapaIcone, MapPin, MapPinOff, Navigation, Phone } from 'lucide-react';
import { Recomendacao } from '@/lib/types';
import { recommendationsAPI } from '@/lib/api';
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  ErroAviso,
  ListaSkeleton,
  PageHeader,
  Preenchimento,
  buttonClasses,
  type Tom,
} from '@/components/ui';

// Vendedor fixo do protótipo (sem autenticação).
const VENDEDOR_ID = 'seller-1';

const STATUS: Record<string, { rotulo: string; tom: Tom }> = {
  lead: { rotulo: 'Lead', tom: 'danger' },
  oportunidade: { rotulo: 'Oportunidade', tom: 'warning' },
  cliente: { rotulo: 'Cliente', tom: 'success' },
  churn: { rotulo: 'Churn', tom: 'neutral' },
};

const TURNOS: Record<string, string> = { manha: 'manhã', tarde: 'tarde', noite: 'noite' };

/** Cor do motivo conforme o que ele significa para o vendedor. */
function tomDoMotivo(motivo: string): Tom {
  if (motivo.includes('vencida')) return 'danger';
  if (motivo.includes('crítica')) return 'warning';
  if (motivo.includes('retorno')) return 'primary';
  if (motivo.includes('potencial') || motivo.includes('cliente na Praso')) return 'success';
  if (motivo.includes('cadastrado')) return 'primary';
  return 'neutral';
}

export default function HojePage() {
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [semLocalizacao, setSemLocalizacao] = useState(false);
  const [dataHoje, setDataHoje] = useState('');

  useEffect(() => {
    // A data é calculada no navegador para não divergir da página pré-renderizada.
    setDataHoje(
      new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
    );

    // Pede a posição para calcular a distância; se o usuário negar, a lista sai sem distância.
    function obterOrigem(): Promise<{ lat: number; lng: number } | undefined> {
      return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(undefined);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(undefined),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
        );
      });
    }

    async function carregar() {
      try {
        const origem = await obterOrigem();
        setSemLocalizacao(!origem);
        setRecomendacoes(await recommendationsAPI.getByVendedor(VENDEDOR_ID, origem));
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar estabelecimentos');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <>
      <PageHeader titulo="Hoje" subtitulo={dataHoje || 'Carteira do dia'} />

      {carregando && <ListaSkeleton itens={3} altura="h-56" />}
      {erro && <ErroAviso mensagem={erro} />}

      {!carregando && !erro && recomendacoes.length === 0 && (
        <EmptyState
          icone={<CalendarX2 aria-hidden="true" className="size-8" />}
          titulo="Nenhum estabelecimento para hoje"
          descricao="Quando houver estabelecimentos na sua carteira, eles aparecem aqui por ordem de prioridade."
        />
      )}

      {!carregando && recomendacoes.length > 0 && (
        <div className="space-y-3 p-4">
          {semLocalizacao && (
            <p className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              <MapPinOff aria-hidden="true" className="size-4 shrink-0" />
              Sem acesso à sua localização: a distância não entra na ordem da lista.
            </p>
          )}

          <ol className="space-y-3">
            {recomendacoes.map(({ establishment: est, score, motivos }, i) => {
              const status = STATUS[est.status] ?? STATUS.churn;
              const prioridade = Math.round(score * 100);
              const temCoordenadas = est.latitude != null && est.longitude != null;
              const horario = est.melhorHorario
                ? `melhor às ${est.melhorHorario}`
                : est.melhorTurno
                  ? `melhor à ${TURNOS[est.melhorTurno]}`
                  : null;

              return (
                <li key={est.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
                  <Card className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span
                        aria-label={`Posição ${i + 1}`}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary-text"
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 text-base font-bold text-foreground">{est.nomeFantasia}</h2>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin aria-hidden="true" className="size-3.5" />
                            {est.bairro} · <span className="capitalize">{est.segmento}</span>
                          </span>
                          {horario && (
                            <span className="inline-flex items-center gap-1">
                              <Clock aria-hidden="true" className="size-3.5" />
                              {horario}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge tom={status.tom}>{status.rotulo}</Badge>
                    </div>

                    {/* Prioridade */}
                    <div className="flex items-center gap-3">
                      <div
                        role="meter"
                        aria-label="Prioridade"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={prioridade}
                        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                      >
                        <Preenchimento porcentagem={prioridade} className="bg-primary" atraso={200} />
                      </div>
                      <span className="text-xs font-bold tabular-nums text-muted-foreground">
                        Prioridade {prioridade}
                      </span>
                    </div>

                    {/* Por que está nesta posição */}
                    {motivos.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5">
                        {motivos.map((motivo) => (
                          <li key={motivo}>
                            <Badge tom={tomDoMotivo(motivo)}>{motivo}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Ações */}
                    <div className="space-y-2 pt-1">
                      <ButtonLink href={`/visita/${est.id}`} tamanho="lg" cheio>
                        Iniciar visita
                      </ButtonLink>
                      <div className="grid grid-cols-3 gap-2">
                        {est.telefone ? (
                          <a
                            href={`tel:${est.telefone.replace(/[^0-9+]/g, '')}`}
                            className={buttonClasses({ variante: 'outline' })}
                          >
                            <Phone aria-hidden="true" className="size-4" />
                            Ligar
                          </a>
                        ) : (
                          <span
                            aria-disabled="true"
                            aria-label="Ligar (sem telefone cadastrado)"
                            className={buttonClasses({ variante: 'outline', className: 'opacity-50' })}
                          >
                            <Phone aria-hidden="true" className="size-4" />
                            Ligar
                          </span>
                        )}
                        <a
                          href={
                            temCoordenadas
                              ? `https://www.google.com/maps/search/?api=1&query=${est.latitude},${est.longitude}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(est.endereco)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonClasses({ variante: 'outline' })}
                        >
                          <MapaIcone aria-hidden="true" className="size-4" />
                          Maps
                        </a>
                        {temCoordenadas ? (
                          <a
                            href={`https://waze.com/ul?ll=${est.latitude},${est.longitude}&navigate=yes`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonClasses({ variante: 'outline' })}
                          >
                            <Navigation aria-hidden="true" className="size-4" />
                            Waze
                          </a>
                        ) : (
                          <span
                            aria-disabled="true"
                            className={buttonClasses({ variante: 'outline', className: 'opacity-50' })}
                          >
                            <Navigation aria-hidden="true" className="size-4" />
                            Waze
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </>
  );
}
