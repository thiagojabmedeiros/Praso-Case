'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ChevronRight, Target, Trophy } from 'lucide-react';
import { establishmentsAPI, followupsAPI, sellersAPI } from '@/lib/api';
import { Establishment, FollowUp, Seller } from '@/lib/types';
import { Card, ErroAviso, PageHeader, Skeleton, StatTile } from '@/components/ui';

const VENDEDOR_ID = 'seller-1';

export default function Home() {
  const [vendedor, setVendedor] = useState<Seller | null>(null);
  const [estabelecimentos, setEstabelecimentos] = useState<Establishment[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const [v, e, f] = await Promise.allSettled([
        sellersAPI.getById(VENDEDOR_ID),
        establishmentsAPI.getAll(),
        followupsAPI.getByVendedor(VENDEDOR_ID),
      ]);
      if (v.status === 'fulfilled') setVendedor(v.value);
      if (e.status === 'fulfilled') setEstabelecimentos(e.value);
      if (f.status === 'fulfilled') setFollowups(f.value);
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

  return (
    <>
      <PageHeader titulo="Praso" subtitulo={primeiroNome ? `Olá, ${primeiroNome}` : 'Plataforma de campo'} />

      {erro && <ErroAviso mensagem={erro} />}

      <div className="space-y-4 p-4">
        {/* Pontuação */}
        <Card className="animate-fade-up flex items-center gap-4 bg-primary p-5 text-on-primary border-transparent">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Trophy aria-hidden="true" className="size-7" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-90">Sua pontuação</p>
            {carregando ? (
              <Skeleton className="mt-1 h-9 w-24 bg-white/20" />
            ) : (
              <p className="text-4xl font-extrabold tabular-nums">
                {(vendedor?.pontuacaoAcumulada ?? 0).toLocaleString('pt-BR')}
                <span className="ml-1 text-base font-semibold opacity-90">pts</span>
              </p>
            )}
          </div>
        </Card>

        {/* Funil */}
        <section aria-labelledby="funil">
          <h2 id="funil" className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Seu funil
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <StatTile valor={carregando ? '–' : contar('lead')} rotulo="Leads" tom="danger" />
            <StatTile valor={carregando ? '–' : contar('oportunidade')} rotulo="Oportunidades" tom="warning" />
            <StatTile valor={carregando ? '–' : contar('cliente')} rotulo="Clientes" tom="success" />
          </div>
        </section>

        {/* Atalhos */}
        <section aria-labelledby="atalhos" className="space-y-3">
          <h2 id="atalhos" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Seu dia
          </h2>

          <Link href="/hoje" className="block">
            <Card className="flex items-center gap-4 transition-colors hover:bg-muted">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-text">
                <CalendarCheck aria-hidden="true" className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">Carteira do dia</p>
                <p className="text-sm text-muted-foreground">Estabelecimentos na ordem de prioridade</p>
              </div>
              <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            </Card>
          </Link>

          <Link href="/carteira" className="block">
            <Card className="flex items-center gap-4 transition-colors hover:bg-muted">
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
              <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            </Card>
          </Link>
        </section>
      </div>
    </>
  );
}
