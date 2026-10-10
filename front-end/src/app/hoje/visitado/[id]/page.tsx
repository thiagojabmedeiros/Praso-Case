'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { CalendarCheck2, Clock, PhoneCall, StickyNote, Truck } from 'lucide-react';
import { establishmentsAPI, fornecimentosAPI, visitsAPI } from '@/lib/api';
import { Establishment, Fornecimento, Visit, VisitResult } from '@/lib/types';
import { Badge, Card, EmptyState, ErroAviso, ListaSkeleton, PageHeader, type Tom } from '@/components/ui';

const CATEGORIA: Record<string, string> = {
  carne: 'Carne',
  pao: 'Pão',
  bebidas: 'Bebidas',
  laticinios: 'Laticínios',
  hortifruti: 'Hortifruti',
  mercearia: 'Mercearia',
  embalagens: 'Embalagens',
  outros: 'Outros',
};

// Vendedor fixo do protótipo (sem autenticação).
const VENDEDOR_ID = 'seller-1';

const FUSO = 'America/Recife';

const RESULTADO: Record<VisitResult, { rotulo: string; tom: Tom }> = {
  cadastrou: { rotulo: 'Cadastrou', tom: 'success' },
  compra: { rotulo: 'Compra', tom: 'success' },
  'em-acompanhamento': { rotulo: 'Acompanhar', tom: 'primary' },
  ausente: { rotulo: 'Ausente', tom: 'warning' },
  fechado: { rotulo: 'Fechado', tom: 'warning' },
  recusou: { rotulo: 'Recusou', tom: 'danger' },
};

const STATUS: Record<string, { rotulo: string; tom: Tom }> = {
  lead: { rotulo: 'Lead', tom: 'danger' },
  oportunidade: { rotulo: 'Oportunidade', tom: 'warning' },
  cliente: { rotulo: 'Cliente', tom: 'success' },
  churn: { rotulo: 'Churn', tom: 'neutral' },
};

const TURNOS: Record<string, string> = { manha: 'manhã', tarde: 'tarde', noite: 'noite' };

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const diaDe = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date(iso));
const horaDe = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: FUSO });
const dataCurta = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR');

function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

/** Resumo somente leitura do que foi feito num estabelecimento hoje. Não tem ações de registro. */
export default function VisitadoHojePage() {
  const params = useParams<{ id: string }>();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [visitasHoje, setVisitasHoje] = useState<Visit[]>([]);
  const [fornecimentos, setFornecimentos] = useState<Fornecimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const hoje = diaDe(new Date().toISOString());
    async function carregar() {
      try {
        const [est, vis, forn] = await Promise.all([
          establishmentsAPI.getById(params.id),
          visitsAPI.getByEstablishment(params.id),
          fornecimentosAPI.listar(params.id).catch(() => [] as Fornecimento[]),
        ]);
        setEstablishment(est);
        setFornecimentos(forn);
        setVisitasHoje(
          vis
            .filter((v) => v.vendedorId === VENDEDOR_ID && !v.anuladaEm && diaDe(v.dataHora) === hoje)
            .sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
        );
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar o resumo');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [params.id]);

  if (carregando) {
    return (
      <>
        <PageHeader titulo="Resumo" voltar={{ href: '/hoje', rotulo: 'Voltar para Hoje' }} />
        <ListaSkeleton itens={2} altura="h-40" />
      </>
    );
  }

  if (erro || !establishment) {
    return (
      <>
        <PageHeader titulo="Resumo" voltar={{ href: '/hoje', rotulo: 'Voltar para Hoje' }} />
        <ErroAviso mensagem={erro || 'Estabelecimento não encontrado.'} />
      </>
    );
  }

  const status = STATUS[establishment.status] ?? STATUS.churn;
  const horario = establishment.melhorHorario
    ? `melhor às ${establishment.melhorHorario}`
    : establishment.melhorTurno
      ? `melhor à ${TURNOS[establishment.melhorTurno]}`
      : null;
  const compraHoje = visitasHoje.filter((v) => v.resultado === 'compra' && v.compra);
  const totalHoje = compraHoje.reduce((soma, v) => soma + (v.compra?.valor ?? 0), 0);

  return (
    <>
      <PageHeader
        titulo={establishment.nomeFantasia}
        voltar={{ href: '/hoje', rotulo: 'Voltar para Hoje' }}
      />

      <div className="space-y-4 p-4">
        <Card className="animate-fade-up space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Cadastro</h2>
            <Badge tom={status.tom}>{status.rotulo}</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Dado rotulo="Potencial">
              <span className="capitalize">{establishment.potencial}</span>
            </Dado>
            <Dado rotulo="Segmento">
              <span className="capitalize">{establishment.segmento}</span>
            </Dado>
            <Dado rotulo="Telefone">{establishment.telefone ?? '—'}</Dado>
            <Dado rotulo="Horário">{horario ?? '—'}</Dado>
            <div className="col-span-2">
              <Dado rotulo="Endereço">{establishment.endereco}</Dado>
            </div>
          </dl>
          {establishment.notasContexto && (
            <p className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
              <StickyNote aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              {establishment.notasContexto}
            </p>
          )}
        </Card>

        <Card className="animate-fade-up space-y-3" style={{ animationDelay: '60ms' }}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            O que foi feito hoje ({visitasHoje.length})
          </h2>

          {visitasHoje.length === 0 ? (
            <EmptyState
              icone={<CalendarCheck2 aria-hidden="true" className="size-7" />}
              titulo="Nenhuma visita registrada hoje"
              descricao="As visitas registradas neste estabelecimento hoje aparecem aqui."
            />
          ) : (
            <>
              <ol className="space-y-3">
                {visitasHoje.map((v) => (
                  <li key={v.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-muted-foreground">
                        <Clock aria-hidden="true" className="size-3.5" />
                        {horaDe(v.dataHora)}
                      </span>
                      <Badge tom={RESULTADO[v.resultado].tom}>{RESULTADO[v.resultado].rotulo}</Badge>
                      {v.compra && (
                        <span className="text-sm font-bold tabular-nums text-foreground">{moeda(v.compra.valor)}</span>
                      )}
                    </div>
                    {v.nota && <p className="mt-2 text-sm text-foreground">{v.nota}</p>}
                    {v.proximoContato && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <PhoneCall aria-hidden="true" className="size-3.5" />
                        Próximo contato: {dataCurta(v.proximoContato)}
                      </p>
                    )}
                    {fornecimentos.some((f) => f.visitId === v.id) && (
                      <div className="mt-3 border-t border-border pt-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <Truck aria-hidden="true" className="size-3.5" />
                          Fornecedores cadastrados nesta visita
                        </p>
                        <ul className="mt-1.5 flex flex-wrap gap-1.5">
                          {fornecimentos
                            .filter((f) => f.visitId === v.id)
                            .map((f) => (
                              <li key={f.id}>
                                <Badge tom="primary">
                                  {f.distribuidora.nome} · {CATEGORIA[f.categoria] ?? f.categoria}
                                </Badge>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ol>

              {compraHoje.length > 0 && (
                <p className="border-t border-border pt-3 text-sm font-semibold text-foreground">
                  Total em compras hoje: {compraHoje.length} · {moeda(totalHoje)}
                </p>
              )}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
