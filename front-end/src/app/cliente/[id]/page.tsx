'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import {
  Ban,
  CalendarClock,
  DoorClosed,
  PhoneCall,
  ShoppingCart,
  ThumbsDown,
  UserPlus,
  UserX,
  type LucideIcon,
} from 'lucide-react';
import { Establishment, Purchase, Visit, VisitResult } from '@/lib/types';
import { establishmentsAPI, purchasesAPI, visitsAPI } from '@/lib/api';
import { FornecimentosCard } from '@/components/fornecimentos-card';
import { Badge, Button, Card, EmptyState, ErroAviso, ListaSkeleton, PageHeader, cn, type Tom } from '@/components/ui';

const RESULTADOS: Record<VisitResult, { rotulo: string; Icone: LucideIcon; tom: Tom }> = {
  cadastrou: { rotulo: 'Cadastrou', Icone: UserPlus, tom: 'success' },
  compra: { rotulo: 'Compra', Icone: ShoppingCart, tom: 'success' },
  'em-acompanhamento': { rotulo: 'Acompanhar', Icone: PhoneCall, tom: 'primary' },
  ausente: { rotulo: 'Ausente', Icone: UserX, tom: 'warning' },
  fechado: { rotulo: 'Fechado', Icone: DoorClosed, tom: 'warning' },
  recusou: { rotulo: 'Recusou', Icone: ThumbsDown, tom: 'danger' },
};

const STATUS: Record<string, { rotulo: string; tom: Tom }> = {
  lead: { rotulo: 'Lead', tom: 'danger' },
  oportunidade: { rotulo: 'Oportunidade', tom: 'warning' },
  cliente: { rotulo: 'Cliente', tom: 'success' },
  churn: { rotulo: 'Churn', tom: 'neutral' },
};

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rotulo}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

export default function ClientePage() {
  const params = useParams<{ id: string }>();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [est, vis, pur] = await Promise.all([
          establishmentsAPI.getById(params.id),
          visitsAPI.getByEstablishment(params.id),
          purchasesAPI.getByEstablishment(params.id),
        ]);
        setEstablishment(est);
        setVisits(vis);
        setPurchases(pur);
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar cliente');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [params.id]);

  const anular = async (visita: Visit) => {
    const motivo = window.prompt('Por que você está anulando esta visita?');
    if (!motivo || !motivo.trim()) return;
    try {
      setErroAcao(null);
      const anulada = await visitsAPI.anular(visita.id, motivo.trim());
      setVisits((atual) => atual.map((v) => (v.id === visita.id ? anulada : v)));
    } catch (err) {
      setErroAcao(err instanceof Error ? err.message : 'Erro ao anular a visita.');
    }
  };

  if (carregando) {
    return (
      <>
        <PageHeader titulo="Cliente" voltar={{ href: '/carteira', rotulo: 'Voltar para a carteira' }} />
        <ListaSkeleton itens={3} altura="h-40" />
      </>
    );
  }

  if (erro || !establishment) {
    return (
      <>
        <PageHeader titulo="Cliente" voltar={{ href: '/carteira', rotulo: 'Voltar para a carteira' }} />
        <ErroAviso mensagem={erro || 'Cliente não encontrado.'} />
      </>
    );
  }

  const status = STATUS[establishment.status] ?? STATUS.churn;

  return (
    <>
      <PageHeader
        titulo={establishment.nomeFantasia}
        subtitulo={establishment.razaoSocial ?? undefined}
        voltar={{ href: '/carteira', rotulo: 'Voltar para a carteira' }}
        acao={<Badge tom={status.tom}>{status.rotulo}</Badge>}
      />

      <div className="space-y-4 p-4">
        {/* Informações */}
        <Card className="animate-fade-up space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Informações</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Dado rotulo="CNPJ">
              {establishment.cnpj ? <span className="font-mono">{establishment.cnpj}</span> : '—'}
            </Dado>
            <Dado rotulo="Segmento">
              <span className="capitalize">{establishment.segmento}</span>
            </Dado>
            <Dado rotulo="Telefone">{establishment.telefone ?? '—'}</Dado>
            <Dado rotulo="Bairro">{establishment.bairro}</Dado>
            <div className="col-span-2">
              <Dado rotulo="Endereço">{establishment.endereco}</Dado>
            </div>
          </dl>
        </Card>

        <Card className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <FornecimentosCard establishmentId={establishment.id} />
        </Card>

        {/* Compras */}
        <Card className="animate-fade-up space-y-3" style={{ animationDelay: '100ms' }}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Compras ({purchases.length})
          </h2>
          {purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma compra registrada.</p>
          ) : (
            <ul className="divide-y divide-border">
              {purchases.map((compra) => (
                <li key={compra.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{dia(compra.data)}</p>
                    <p className="text-xs text-muted-foreground">
                      {compra.autonoma ? 'Compra autônoma' : 'Com apoio do vendedor'}
                    </p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-foreground">{moeda(compra.valor)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Visitas */}
        <Card className="animate-fade-up space-y-3" style={{ animationDelay: '150ms' }}>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Histórico de visitas ({visits.length})
          </h2>
          {erroAcao && (
            <p
              key={erroAcao}
              role="alert"
              className="animate-fade-up rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger-text"
            >
              {erroAcao}
            </p>
          )}
          {visits.length === 0 ? (
            <EmptyState
              icone={<CalendarClock aria-hidden="true" className="size-7" />}
              titulo="Nenhuma visita ainda"
              descricao="As visitas registradas para este cliente aparecem aqui."
            />
          ) : (
            <ol className="space-y-3">
              {visits.map((visita) => {
                const r = RESULTADOS[visita.resultado];
                const anulada = Boolean(visita.anuladaEm);
                return (
                  <li
                    key={visita.id}
                    className={cn(
                      'rounded-xl border border-border p-3 transition-[background-color,opacity] duration-300 ease-out-strong',
                      anulada ? 'bg-muted opacity-70' : 'bg-card',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        tom={anulada ? 'neutral' : r.tom}
                        icone={<r.Icone aria-hidden="true" className="size-3.5" />}
                      >
                        {r.rotulo}
                      </Badge>
                      <time
                        dateTime={visita.dataHora}
                        className="text-xs font-medium tabular-nums text-muted-foreground"
                      >
                        {new Date(visita.dataHora).toLocaleDateString('pt-BR')} ·{' '}
                        {new Date(visita.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>

                    {visita.nota && <p className="mt-2 text-sm text-foreground">{visita.nota}</p>}

                    {visita.proximoContato && !anulada && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <CalendarClock aria-hidden="true" className="size-3.5" />
                        Próximo contato: {dia(visita.proximoContato)}
                      </p>
                    )}

                    {anulada ? (
                      <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-danger-text">
                        <Ban aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                        Anulada em {dia(visita.anuladaEm as string)}: {visita.motivoAnulacao}
                      </p>
                    ) : (
                      <Button variante="ghost" className="-ml-3 mt-1 text-xs" onClick={() => anular(visita)}>
                        Anular visita
                      </Button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
