'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ChevronRight, Target, Trophy } from 'lucide-react';
import { establishmentsAPI, followupsAPI, recommendationsAPI, sellersAPI } from '@/lib/api';
import { Establishment, FollowUp, Recomendacao, Seller } from '@/lib/types';
import { Card, ErroAviso, Numero, PageHeader, Preenchimento, Skeleton, StatTile } from '@/components/ui';

const VENDEDOR_ID = 'seller-1';

export default function Home() {
  const [vendedor, setVendedor] = useState<Seller | null>(null);
  const [estabelecimentos, setEstabelecimentos] = useState<Establishment[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const [v, e, f, r] = await Promise.allSettled([
        sellersAPI.getById(VENDEDOR_ID),
        establishmentsAPI.getAll(),
        followupsAPI.getByVendedor(VENDEDOR_ID),
        recommendationsAPI.getByVendedor(VENDEDOR_ID),
      ]);
      if (v.status === 'fulfilled') setVendedor(v.value);
      if (e.status === 'fulfilled') setEstabelecimentos(e.value);
      if (f.status === 'fulfilled') setFollowups(f.value);
      if (r.status === 'fulfilled') setRecomendacoes(r.value);
      if (v.status === 'rejected' && e.status === 'rejected' && f.status === 'rejected') {
        setErro('Não foi possível carregar o painel. Verifique a conexão e tente de novo.');
      }
      setCarregando(false);
    }
    carregar();
  }, []);

  const contar = (status: Establishment['status']) =>
    estabelecimentos.filter((e) => e.status === status).length;
  const urgentes = followups.filter(
    (f) => !f.metaBatida && (f.urgencia === 'vencida' || f.urgencia === 'critica'),
  ).length;
  const primeiroNome = vendedor?.nome.split(' ')[0];
  // Progresso de hoje: visitas feitas sobre a carteira de hoje (a própria carteira é a meta do dia).
  const visitadasHoje = recomendacoes.filter((r) => r.visitadoHoje).length;
  const carteiraHoje = recomendacoes.length;
  const percentualHoje = carteiraHoje ? Math.round((visitadasHoje / carteiraHoje) * 100) : 0;

  return (
    <>
      <PageHeader titulo="Praso" subtitulo={primeiroNome ? `Olá, ${primeiroNome}` : 'Plataforma de campo'} />

      {erro && <ErroAviso mensagem={erro} />}

      <div className="flex flex-col gap-4 p-4 lg:grid lg:grid-cols-6 lg:gap-6 lg:p-8">
        {/* Pontuação */}
        <Card className="animate-fade-up flex items-center gap-4 bg-primary p-5 text-on-primary border-transparent lg:col-span-2">
          <div
            className="flex size-14 shrink-0 animate-pop items-center justify-center rounded-2xl bg-white/15"
            style={{ animationDelay: '120ms' }}
          >
            <Trophy aria-hidden="true" className="size-7" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-90">Sua pontuação</p>
            {carregando ? (
              <Skeleton className="mt-1 h-9 w-24 bg-white/20" />
            ) : (
              <p className="text-4xl font-extrabold tabular-nums">
                <Numero valor={vendedor?.pontuacaoAcumulada ?? 0} chave="home:pontos" duracao={800} />
                <span className="ml-1 text-base font-semibold opacity-90">pts</span>
              </p>
            )}
          </div>
        </Card>

        {/* Progresso de hoje: o KPI principal do dia, com comparação contra a carteira */}
        <Card vidro className="animate-fade-up space-y-3 lg:col-span-4 lg:self-stretch" style={{ animationDelay: '90ms' }}>
          {carregando ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-base font-bold text-foreground">
                  Hoje: {visitadasHoje} de {carteiraHoje} visitas feitas
                </p>
                <p className="text-sm font-semibold tabular-nums text-muted-foreground">{percentualHoje}%</p>
              </div>
              <div
                role="meter"
                aria-label="Visitas feitas hoje"
                aria-valuemin={0}
                aria-valuemax={carteiraHoje}
                aria-valuenow={visitadasHoje}
                className="h-2 overflow-hidden rounded-full bg-muted"
              >
                <Preenchimento porcentagem={percentualHoje} className="bg-primary" atraso={150} />
              </div>
              <p className="text-xs text-muted-foreground">
                {carteiraHoje - visitadasHoje} pendentes na carteira de hoje
              </p>
            </>
          )}
        </Card>

        {/* Funil */}
        <section aria-labelledby="funil" className="animate-fade-up lg:col-span-6" style={{ animationDelay: '50ms' }}>
          <h2 id="funil" className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Seu funil
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <StatTile valor={carregando ? '–' : contar('lead')} rotulo="Leads" tom="neutral" />
            <StatTile valor={carregando ? '–' : contar('oportunidade')} rotulo="Oportunidades" tom="primary" />
            <StatTile valor={carregando ? '–' : contar('cliente')} rotulo="Clientes" tom="success" />
          </div>
        </section>

        {/* Atalhos */}
        <section
          aria-labelledby="atalhos"
          className="animate-fade-up space-y-3 lg:col-span-6 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0"
          style={{ animationDelay: '100ms' }}
        >
          <h2 id="atalhos" className="text-sm font-bold uppercase tracking-wide text-muted-foreground lg:col-span-2">
            Seu dia
          </h2>

          <Link href="/hoje" className="group block">
            <Card interativo className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-text">
                <CalendarCheck aria-hidden="true" className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">Carteira do dia</p>
                <p className="text-sm text-muted-foreground">Estabelecimentos na ordem de prioridade</p>
              </div>
              <ChevronRight
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5"
              />
            </Card>
          </Link>

          <Link href="/recorrencias" className="group block">
            <Card interativo className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success-text">
                <Target aria-hidden="true" className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">Recorrência</p>
                <p className="text-sm text-muted-foreground">
                  {carregando
                    ? 'Carregando…'
                    : urgentes > 0
                      ? `${urgentes} ${urgentes === 1 ? 'cliente precisa' : 'clientes precisam'} de atenção`
                      : 'Nenhum cliente urgente agora'}
                </p>
              </div>
              <ChevronRight
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5"
              />
            </Card>
          </Link>
        </section>
      </div>
    </>
  );
}
