'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, FileText, MapPin, PhoneCall } from 'lucide-react';
import { establishmentsAPI, recommendationsAPI, visitsAPI } from '@/lib/api';
import { Establishment, Recomendacao, Visit, VisitResult } from '@/lib/types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErroAviso,
  ListaSkeleton,
  PageHeader,
  StatTile,
  type Tom,
} from '@/components/ui';

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

const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// Versão curta para o card (ex.: R$ 12,3 mil), para caber em três colunas.
const moedaCompacta = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });
const diaDe = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date(iso));
const horaDe = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: FUSO });
const dataCurta = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR');

interface Linha {
  estabelecimento: Establishment;
  visitas: Visit[];
  primeiraHora: string;
}

/** Texto para colar no WhatsApp ou no e-mail do gestor. */
function montarTexto(data: string, linhas: Linha[], totais: Totais): string {
  const cabecalho = [
    `Resumo do dia — ${new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')}`,
    `Já visitados: ${totais.jaVisitados} · Pendentes: ${totais.pendentes} · Cadastros: ${totais.cadastros} · Compras: ${totais.compras}${totais.compras ? ` (${moeda(totais.valorCompras)})` : ''} · Recusados: ${totais.recusados} · Acompanhar: ${totais.acompanhar}`,
  ];
  const corpo = linhas.map(({ estabelecimento: est, visitas }, i) => {
    const acoes = visitas.map((v) => {
      const partes = [RESULTADO[v.resultado].rotulo];
      if (v.compra) partes.push(moeda(v.compra.valor));
      return `${horaDe(v.dataHora)} ${partes.join(' · ')}`;
    });
    const notas = visitas.map((v) => v.nota.trim()).filter(Boolean);
    const retorno = [...visitas].reverse().find((v) => v.proximoContato)?.proximoContato;
    const linhasDoItem = [`${i + 1}. ${est.nomeFantasia} (${est.bairro})`, `   ${acoes.join(' | ')}`];
    if (notas.length) linhasDoItem.push(`   Nota: ${notas.join(' / ')}`);
    if (retorno) linhasDoItem.push(`   Retorno: ${dataCurta(retorno)}`);
    return linhasDoItem.join('\n');
  });
  return [...cabecalho, '', ...corpo].join('\n');
}

interface Totais {
  jaVisitados: number;
  pendentes: number;
  recusados: number;
  cadastros: number;
  compras: number;
  valorCompras: number;
  acompanhar: number;
}

export default function ResumoDoDiaPage() {
  const [visitas, setVisitas] = useState<Visit[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Establishment[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [data, setData] = useState('');
  const [atualizadoEm, setAtualizadoEm] = useState('');

  useEffect(() => {
    setData(diaDe(new Date().toISOString()));
    async function carregar() {
      try {
        const [vis, est, rec] = await Promise.all([
          visitsAPI.getAll(),
          establishmentsAPI.getAll(),
          recommendationsAPI.getByVendedor(VENDEDOR_ID),
        ]);
        setVisitas(vis);
        setEstabelecimentos(est);
        setRecomendacoes(rec);
        setAtualizadoEm(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: FUSO }));
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao carregar o resumo');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // Só visitas válidas (não anuladas), do vendedor, de hoje, no fuso de Recife.
  const doDia = useMemo(
    () =>
      visitas
        .filter((v) => v.vendedorId === VENDEDOR_ID && !v.anuladaEm && data && diaDe(v.dataHora) === data)
        .sort((a, b) => a.dataHora.localeCompare(b.dataHora)),
    [visitas, data],
  );

  // Um item por estabelecimento, na ordem da primeira visita do dia.
  const linhas = useMemo<Linha[]>(() => {
    const porId = new Map(estabelecimentos.map((e) => [e.id, e]));
    const grupos = new Map<string, Visit[]>();
    for (const v of doDia) {
      grupos.set(v.establishmentId, [...(grupos.get(v.establishmentId) ?? []), v]);
    }
    const resultado: Linha[] = [];
    for (const [id, vs] of grupos) {
      const est = porId.get(id);
      if (est) resultado.push({ estabelecimento: est, visitas: vs, primeiraHora: vs[0].dataHora });
    }
    return resultado.sort((a, b) => a.primeiraHora.localeCompare(b.primeiraHora));
  }, [doDia, estabelecimentos]);

  const totais = useMemo<Totais>(() => {
    const compras = doDia.filter((v) => v.resultado === 'compra');
    // Mesma regra das abas de Hoje: visitado hoje (pelo back-end) ou pendente.
    return {
      jaVisitados: recomendacoes.filter((r) => r.visitadoHoje).length,
      pendentes: recomendacoes.filter((r) => !r.visitadoHoje).length,
      recusados: doDia.filter((v) => v.resultado === 'recusou').length,
      cadastros: doDia.filter((v) => v.resultado === 'cadastrou').length,
      compras: compras.length,
      valorCompras: compras.reduce((soma, v) => soma + (v.compra?.valor ?? 0), 0),
      acompanhar: doDia.filter((v) => v.resultado === 'em-acompanhamento').length,
    };
  }, [doDia, recomendacoes]);

  const copiarResumo = async () => {
    try {
      await navigator.clipboard.writeText(montarTexto(data, linhas, totais));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sem permissão de área de transferência: o resumo continua na tela.
    }
  };

  return (
    <>
      <PageHeader
        titulo="Resumo do dia"
        subtitulo={data ? new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Hoje'}
        voltar={{ href: '/hoje', rotulo: 'Voltar para Hoje' }}
      />

      {carregando && <ListaSkeleton itens={3} altura="h-40" />}
      {erro && <ErroAviso mensagem={erro} />}

      {!carregando && !erro && linhas.length === 0 && (
        <EmptyState
          icone={<FileText aria-hidden="true" className="size-8" />}
          titulo="Nenhuma visita registrada hoje"
          descricao="Quando você registrar visitas, o resumo do dia aparece aqui."
        />
      )}

      {!carregando && !erro && linhas.length > 0 && (
        <div className="space-y-4 p-4">
          <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary-text">
            {`Você visitou ${totais.jaVisitados} de ${totais.jaVisitados + totais.pendentes} estabelecimentos`}
            {totais.compras > 0
              ? ` e fechou ${totais.compras} ${totais.compras === 1 ? 'compra' : 'compras'}, somando ${moeda(totais.valorCompras)}.`
              : '.'}
          </p>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <StatTile valor={totais.jaVisitados} rotulo="Já visitados" tom="primary" />
              <StatTile valor={totais.pendentes} rotulo="Pendentes" tom="warning" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatTile valor={totais.cadastros} rotulo="Cadastros" tom="primary" />
              <StatTile
                valor={totais.compras ? moedaCompacta(totais.valorCompras) : '—'}
                rotulo={`Compras (${totais.compras})`}
                tom="success"
              />
              <StatTile valor={totais.recusados} rotulo="Recusados" tom={totais.recusados > 0 ? 'danger' : 'neutral'} />
            </div>
          </div>

          <Button variante="outline" cheio onClick={copiarResumo}>
            {copiado ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
            {copiado ? 'Resumo copiado' : 'Copiar resumo'}
          </Button>

          <ol className="space-y-3">
            {linhas.map(({ estabelecimento: est, visitas: vs }, i) => {
              const retorno = [...vs].reverse().find((v) => v.proximoContato)?.proximoContato;
              const notas = vs.map((v) => v.nota.trim()).filter(Boolean);
              return (
                <li key={est.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 45}ms` }}>
                  <Card className="space-y-3">
                    <div>
                      <h2 className="text-base font-bold text-foreground">{est.nomeFantasia}</h2>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin aria-hidden="true" className="size-3.5" />
                        {est.bairro}
                      </p>
                    </div>

                    <ul className="space-y-1.5">
                      {vs.map((v) => (
                        <li key={v.id} className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="tabular-nums text-muted-foreground">{horaDe(v.dataHora)}</span>
                          <Badge tom={RESULTADO[v.resultado].tom}>{RESULTADO[v.resultado].rotulo}</Badge>
                          {v.compra && (
                            <span className="font-semibold tabular-nums text-foreground">{moeda(v.compra.valor)}</span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {notas.length > 0 && (
                      <p className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">{notas.join(' · ')}</p>
                    )}

                    {retorno && (
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <PhoneCall aria-hidden="true" className="size-3.5" />
                        Retorno combinado: {dataCurta(retorno)}
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ol>

          <p className="text-center text-xs text-muted-foreground">
            Dados do dia · atualizado às {atualizadoEm || '—'}
          </p>
        </div>
      )}
    </>
  );
}
