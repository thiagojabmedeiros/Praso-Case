'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarX2, Clock, FileText, MapPin, MapPinOff, Phone } from 'lucide-react';
import { BotaoGoogleMaps, BotaoWaze } from '@/components/botoes-navegacao';
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
  cn,
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

type Aba = 'pendentes' | 'visitados';

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
  const [aba, setAba] = useState<Aba>('pendentes');

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

  // Pendentes são os que ainda não receberam visita hoje; visitados saem da lista principal.
  const pendentes = recomendacoes.filter((r) => !r.visitadoHoje);
  const visitados = recomendacoes.filter((r) => r.visitadoHoje);
  const lista = aba === 'pendentes' ? pendentes : visitados;

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
          <div role="tablist" aria-label="Estabelecimentos de hoje" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(
              [
                { valor: 'pendentes', rotulo: 'Pendentes', total: pendentes.length, Icone: CalendarX2 },
                { valor: 'visitados', rotulo: 'Visitados', total: visitados.length, Icone: CalendarCheck2 },
              ] as const
            ).map(({ valor, rotulo, total, Icone }) => {
              const ativa = aba === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => setAba(valor)}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out-strong active:scale-95',
                    ativa ? 'bg-card text-primary-text shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icone aria-hidden="true" className="size-4" />
                  {rotulo}
                  <span className="rounded-full bg-background px-1.5 text-xs tabular-nums">{total}</span>
                </button>
              );
            })}
          </div>

          {aba === 'visitados' && visitados.length > 0 && (
            <ButtonLink href="/hoje/resumo" variante="outline" cheio>
              <FileText aria-hidden="true" className="size-4" />
              Ver resumo do dia
            </ButtonLink>
          )}

          {semLocalizacao && (
            <p className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              <MapPinOff aria-hidden="true" className="size-4 shrink-0" />
              Sem acesso à sua localização: a distância não entra na ordem da lista.
            </p>
          )}

          {lista.length === 0 && (
            <EmptyState
              icone={
                aba === 'pendentes' ? (
                  <CalendarCheck2 aria-hidden="true" className="size-8" />
                ) : (
                  <CalendarX2 aria-hidden="true" className="size-8" />
                )
              }
              titulo={aba === 'pendentes' ? 'Tudo visitado por hoje' : 'Nenhuma visita registrada hoje'}
              descricao={
                aba === 'pendentes'
                  ? 'Todos os estabelecimentos da lista já receberam visita. Eles estão na aba Visitados.'
                  : 'Quando você registrar uma visita, o estabelecimento aparece aqui.'
              }
            />
          )}

          <ol className="space-y-3">
            {lista.map(({ establishment: est, score, motivos, visitadoHoje }, i) => {
              const status = STATUS[est.status] ?? STATUS.churn;
              const prioridade = Math.round(score * 100);
              const horario = est.melhorHorario
                ? `melhor às ${est.melhorHorario}`
                : est.melhorTurno
                  ? `melhor à ${TURNOS[est.melhorTurno]}`
                  : null;

              return (
                <li key={est.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 45}ms` }}>
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
                        <Preenchimento
                          porcentagem={prioridade}
                          className="bg-primary"
                          atraso={Math.min(i, 5) * 45 + 120}
                        />
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

                    {/* Ações: visitado hoje mostra o resumo do que foi feito; contato e rotas seguem disponíveis */}
                    <div className="space-y-2 pt-1">
                      {visitadoHoje ? (
                        <>
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-success-text">
                            <CalendarCheck2 aria-hidden="true" className="size-3.5" />
                            Visita registrada hoje
                          </p>
                          <ButtonLink href={`/hoje/visitado/${est.id}`} variante="outline" tamanho="lg" cheio>
                            <FileText aria-hidden="true" className="size-4" />
                            Ver o que foi feito hoje
                          </ButtonLink>
                        </>
                      ) : (
                        <ButtonLink href={`/visita/${est.id}`} tamanho="lg" cheio>
                          Iniciar visita
                        </ButtonLink>
                      )}
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
                        <BotaoGoogleMaps destino={est} rotulo="Maps" />
                        <BotaoWaze destino={est} />
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
