'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarX2, Clock, FileText, MapPin, MapPinOff, Phone } from 'lucide-react';
import { BotaoGoogleMaps, BotaoWaze } from '@/components/botoes-navegacao';
import { Recomendacao, Visit, VisitResult } from '@/lib/types';
import { recommendationsAPI, visitsAPI } from '@/lib/api';
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

const RESULTADO: Record<VisitResult, { rotulo: string; tom: Tom }> = {
  cadastrou: { rotulo: 'Cadastrou', tom: 'success' },
  compra: { rotulo: 'Compra', tom: 'success' },
  'em-acompanhamento': { rotulo: 'Acompanhar', tom: 'primary' },
  ausente: { rotulo: 'Ausente', tom: 'warning' },
  fechado: { rotulo: 'Fechado', tom: 'warning' },
  recusou: { rotulo: 'Recusou', tom: 'danger' },
};

const diaRecife = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Recife' }).format(new Date(iso));

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

type Opcao = { valor: string; rotulo: string };

/** Linha de chips rolável. "Todos" fica sempre no começo e limpa o filtro. */
function FiltroChips({
  titulo,
  opcoes,
  valor,
  onChange,
}: {
  titulo: string;
  opcoes: Opcao[];
  valor: string | null;
  onChange: (valor: string | null) => void;
}) {
  const chips: { valor: string | null; rotulo: string }[] = [{ valor: null, rotulo: 'Todos' }, ...opcoes];
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <div role="group" aria-label={titulo} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {chips.map((chip) => {
          const ativo = valor === chip.valor;
          return (
            <button
              key={chip.valor ?? 'todos'}
              type="button"
              aria-pressed={ativo}
              onClick={() => onChange(chip.valor)}
              className={cn(
                'min-h-9 shrink-0 cursor-pointer rounded-full border px-3 text-sm font-semibold transition-[background-color,color,transform] duration-150 ease-out-strong active:scale-95',
                ativo
                  ? 'border-primary bg-primary-soft text-primary-text'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {chip.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export default function HojePage() {
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  // Resultado das visitas válidas de hoje, por estabelecimento (para mostrar a ação feita).
  const [acoesHoje, setAcoesHoje] = useState<Record<string, VisitResult[]>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [semLocalizacao, setSemLocalizacao] = useState(false);
  const [dataHoje, setDataHoje] = useState('');
  const [aba, setAba] = useState<Aba>('pendentes');
  // Filtro de bairro (ambas as abas) e o segundo filtro: segmento em Pendentes, resultado em Visitados.
  const [filtroBairro, setFiltroBairro] = useState<string | null>(null);
  const [filtroExtra, setFiltroExtra] = useState<string | null>(null);

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
        const [rec, vis] = await Promise.all([
          recommendationsAPI.getByVendedor(VENDEDOR_ID, origem),
          visitsAPI.getAll().catch(() => [] as Visit[]),
        ]);
        setRecomendacoes(rec);
        const hoje = diaRecife(new Date().toISOString());
        const acoes: Record<string, VisitResult[]> = {};
        vis
          .filter((v) => v.vendedorId === VENDEDOR_ID && !v.anuladaEm && diaRecife(v.dataHora) === hoje)
          .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
          .forEach((v) => {
            acoes[v.establishmentId] = [...(acoes[v.establishmentId] ?? []), v.resultado];
          });
        setAcoesHoje(acoes);
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

  const bairros = [...new Set(lista.map((r) => r.establishment.bairro))].sort();
  const segmentos = [...new Set(lista.map((r) => r.establishment.segmento))].sort();
  const resultadosPresentes = new Set(lista.flatMap((r) => acoesHoje[r.establishment.id] ?? []));
  const opcoesExtra: Opcao[] =
    aba === 'pendentes'
      ? segmentos.map((s) => ({ valor: s, rotulo: capitalizar(s) }))
      : (Object.keys(RESULTADO) as VisitResult[])
          .filter((r) => resultadosPresentes.has(r))
          .map((r) => ({ valor: r, rotulo: RESULTADO[r].rotulo }));
  const filtrosAtivos = filtroBairro !== null || filtroExtra !== null;

  const listaFiltrada = lista.filter((r) => {
    if (filtroBairro && r.establishment.bairro !== filtroBairro) return false;
    if (filtroExtra && aba === 'pendentes' && r.establishment.segmento !== filtroExtra) return false;
    if (filtroExtra && aba === 'visitados' && !(acoesHoje[r.establishment.id] ?? []).includes(filtroExtra as VisitResult)) {
      return false;
    }
    return true;
  });

  const limparFiltros = () => {
    setFiltroBairro(null);
    setFiltroExtra(null);
  };

  const trocarAba = (nova: Aba) => {
    limparFiltros();
    setAba(nova);
  };

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
        <div className="space-y-3 p-4 lg:p-8">
          <div role="tablist" aria-label="Estabelecimentos de hoje" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 lg:max-w-md">
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
                  onClick={() => trocarAba(valor)}
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

          {lista.length > 0 && (
            <div className="space-y-3">
              {bairros.length > 1 && (
                <FiltroChips
                  titulo="Bairro"
                  opcoes={bairros.map((b) => ({ valor: b, rotulo: b }))}
                  valor={filtroBairro}
                  onChange={setFiltroBairro}
                />
              )}
              {opcoesExtra.length > 1 && (
                <FiltroChips
                  titulo={aba === 'pendentes' ? 'Segmento' : 'Resultado'}
                  opcoes={opcoesExtra}
                  valor={filtroExtra}
                  onChange={setFiltroExtra}
                />
              )}
              {filtrosAtivos && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Mostrando {listaFiltrada.length} de {lista.length}
                  </span>
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="cursor-pointer font-semibold text-primary-text underline-offset-2 hover:underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
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

          {lista.length > 0 && listaFiltrada.length === 0 && (
            <div className="rounded-xl bg-muted px-4 py-6 text-center">
              <p className="text-sm font-semibold text-foreground">Nenhum estabelecimento com esses filtros.</p>
              <button
                type="button"
                onClick={limparFiltros}
                className="mt-2 cursor-pointer text-sm font-semibold text-primary-text underline-offset-2 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}

          <ol className="space-y-3 lg:space-y-4">
            {listaFiltrada.map(({ establishment: est, score, motivos, visitadoHoje }, i) => {
              const status = STATUS[est.status] ?? STATUS.churn;
              const prioridade = Math.round(score * 100);
              const acoes = acoesHoje[est.id] ?? [];
              const horario = est.melhorHorario
                ? `melhor às ${est.melhorHorario}`
                : est.melhorTurno
                  ? `melhor à ${TURNOS[est.melhorTurno]}`
                  : null;

              return (
                <li key={est.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 45}ms` }}>
                  <Card className="space-y-3 lg:flex lg:items-center lg:gap-8 lg:space-y-0">
                    {/* Zona de informações: no desktop ocupa o espaço que sobra à esquerda */}
                    <div className="min-w-0 space-y-3 lg:flex-1">
                    <div className="flex items-start gap-3">
                      {visitadoHoje ? (
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-text"
                        >
                          <CalendarCheck2 className="size-5" />
                        </span>
                      ) : (
                        <span
                          aria-label={`Posição ${i + 1}`}
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary-text"
                        >
                          {i + 1}
                        </span>
                      )}
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

                    {/* Visitado hoje: só o status da ação. Métricas e pontuação ficam nos pendentes. */}
                    {visitadoHoje && acoes.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5" aria-label="Ações feitas hoje">
                        {acoes.map((resultado, indice) => (
                          <li key={`${resultado}-${indice}`}>
                            <Badge tom={RESULTADO[resultado].tom}>{RESULTADO[resultado].rotulo}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}

                    {!visitadoHoje && (
                    <>
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

                    </>
                    )}

                    </div>

                    {/* Zona de ações: no desktop é uma coluna de largura fixa, com uma ação principal e as secundárias abaixo.
                        Visitado hoje mostra o resumo do que foi feito; contato e rotas seguem disponíveis. */}
                    <div className="space-y-2 pt-1 lg:w-80 lg:shrink-0 lg:pt-0">
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
