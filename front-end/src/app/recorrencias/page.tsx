'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CalendarClock, Clock, Flame, Phone, Target, Trophy } from 'lucide-react';
import { FollowUp, Establishment } from '@/lib/types';
import { followupsAPI, establishmentsAPI, visitsAPI } from '@/lib/api';
import { Visit } from '@/lib/types';

// Dia no fuso de Recife: a visita "de hoje" segue o mesmo critério da tela Hoje.
const diaRecife = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Recife' }).format(new Date(iso));
import {
  Badge,
  ButtonLink,
  Card,
  Desenha,
  EmptyState,
  ErroAviso,
  ListaSkeleton,
  PageHeader,
  Preenchimento,
  StatTile,
  buttonClasses,
  cn,
} from '@/components/ui';

type Item = FollowUp & { establishment?: Establishment };

const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

/** Selo de situação: o texto sempre acompanha a cor e o ícone. */
function SeloSituacao({ item }: { item: Item }) {
  if (item.metaBatida) {
    return (
      <Badge tom="success" icone={
          <Desenha atraso={200}>
            <Trophy aria-hidden="true" className="size-3.5" />
          </Desenha>
        }>
        Meta batida
      </Badge>
    );
  }
  if (item.urgencia === 'vencida') {
    return (
      <Badge tom="danger" icone={<AlertTriangle aria-hidden="true" className="size-3.5" />}>
        Vencida
      </Badge>
    );
  }
  if (item.urgencia === 'critica') {
    return (
      <Badge tom="warning" icone={<Flame aria-hidden="true" className="size-3.5" />}>
        Crítica
      </Badge>
    );
  }
  return (
    <Badge tom="primary" icone={<Clock aria-hidden="true" className="size-3.5" />}>
      No prazo
    </Badge>
  );
}

/** Três etapas: uma por compra autônoma necessária. */
function Etapas({ feitas, tom, atraso = 0 }: { feitas: number; tom: string; atraso?: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          {i < feitas && <Preenchimento porcentagem={100} className={tom} atraso={atraso + i * 90} />}
        </span>
      ))}
    </div>
  );
}

export default function RecorrenciasPage() {
  const [itens, setItens] = useState<Item[]>([]);
  // Estabelecimentos com visita válida hoje: o botão Visitar fica desabilitado até o dia seguinte.
  const [visitadosHoje, setVisitadosHoje] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [dados, visitas] = await Promise.all([
          followupsAPI.getByVendedor('seller-1'),
          visitsAPI.getAll().catch(() => [] as Visit[]),
        ]);
        const hoje = diaRecife(new Date().toISOString());
        setVisitadosHoje(
          new Set(
            visitas
              .filter((v) => v.vendedorId === 'seller-1' && !v.anuladaEm && diaRecife(v.dataHora) === hoje)
              .map((v) => v.establishmentId),
          ),
        );

        // Enriquece com os dados do estabelecimento (nome, telefone).
        const enriquecidos = await Promise.all(
          dados.map(async (f) => {
            try {
              return { ...f, establishment: await establishmentsAPI.getById(f.establishmentId) };
            } catch {
              return f;
            }
          }),
        );
        setItens(enriquecidos);
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar recorrências');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const emAndamento = itens.filter((i) => !i.metaBatida).length;
  const urgentes = itens.filter((i) => !i.metaBatida && (i.urgencia === 'vencida' || i.urgencia === 'critica')).length;
  const metas = itens.filter((i) => i.metaBatida).length;

  return (
    <>
      <PageHeader titulo="Recorrência" subtitulo="Meta: 3 compras autônomas" />

      {carregando && <ListaSkeleton itens={3} altura="h-52" />}
      {erro && <ErroAviso mensagem={erro} />}

      {!carregando && !erro && itens.length === 0 && (
        <EmptyState
          icone={<Target aria-hidden="true" className="size-8" />}
          titulo="Nenhum cliente em acompanhamento"
          descricao="Quando um estabelecimento fizer a primeira compra, ele passa a ser acompanhado aqui."
        />
      )}

      {!carregando && itens.length > 0 && (
        <div className="space-y-4 p-4 lg:p-8">
          <div className="grid grid-cols-3 gap-2 lg:max-w-4xl">
            <StatTile valor={emAndamento} rotulo="Em andamento" tom="primary" />
            <StatTile valor={urgentes} rotulo="Urgentes" tom="danger" />
            <StatTile valor={metas} rotulo="Metas batidas" tom="success" />
          </div>

          <ul className="space-y-3 lg:max-w-4xl lg:space-y-4">
            {/* Já visitados hoje descem para o fim; a ordem de urgência se mantém dentro de cada grupo. */}
            {[...itens]
              .sort((a, b) => Number(visitadosHoje.has(a.establishmentId)) - Number(visitadosHoje.has(b.establishmentId)))
              .map((item, i) => {
              const est = item.establishment;
              const pendenciaVencida = item.proximaPendencia ? new Date(item.proximaPendencia) < new Date() : false;
              const tomEtapas = item.metaBatida
                ? 'bg-success'
                : item.urgencia === 'vencida'
                  ? 'bg-danger'
                  : item.urgencia === 'critica'
                    ? 'bg-warning'
                    : 'bg-primary';

              return (
                <li key={item.establishmentId} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 45}ms` }}>
                  <Card solido={item.metaBatida} className={cn('space-y-3', item.metaBatida && 'border-success/40 bg-success-soft/40')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/cliente/${item.establishmentId}`} className="block">
                          <h2 className="truncate text-base font-bold text-foreground hover:underline">
                            {est?.nomeFantasia ?? item.establishmentId}
                          </h2>
                        </Link>
                        {est?.razaoSocial && (
                          <p className="truncate text-sm text-muted-foreground">{est.razaoSocial}</p>
                        )}
                      </div>
                      <SeloSituacao item={item} />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">
                          {item.comprasAte}/3 compras autônomas
                        </span>
                        <span className="text-muted-foreground">
                          {item.metaBatida
                            ? 'recorrência concluída'
                            : item.diasRestantes < 0
                              ? `vencida há ${Math.abs(item.diasRestantes)} ${Math.abs(item.diasRestantes) === 1 ? 'dia' : 'dias'}`
                              : `${item.diasRestantes} ${item.diasRestantes === 1 ? 'dia restante' : 'dias restantes'}`}
                        </span>
                      </div>
                      <Etapas feitas={item.comprasAte} tom={tomEtapas} atraso={Math.min(i, 5) * 45 + 150} />
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Última compra</dt>
                        <dd className="font-semibold text-foreground">{dataCurta(item.ultimaCompraData)}</dd>
                      </div>
                      {item.proximaPendencia && !item.metaBatida && (
                        <div>
                          <dt className="flex items-center gap-1 text-muted-foreground">
                            <CalendarClock aria-hidden="true" className="size-3.5" />
                            Próxima pendência
                          </dt>
                          <dd className={cn('font-semibold', pendenciaVencida ? 'text-danger-text' : 'text-foreground')}>
                            {dataCurta(item.proximaPendencia)}
                            {pendenciaVencida && ' · atrasada'}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {/* Ações: cliente que bateu a meta não recebe mais visitas */}
                    {!item.metaBatida && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {visitadosHoje.has(item.establishmentId) ? (
                          <span
                            aria-disabled="true"
                            aria-label="Visitar (indisponível: visita já registrada hoje)"
                            className={buttonClasses({ className: 'opacity-50' })}
                          >
                            Visitado hoje
                          </span>
                        ) : (
                          <ButtonLink href={`/visita/${item.establishmentId}`}>Visitar</ButtonLink>
                        )}
                        {est?.telefone ? (
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
                            className={buttonClasses({ variante: 'outline', className: 'opacity-50' })}
                          >
                            <Phone aria-hidden="true" className="size-4" />
                            Sem telefone
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
