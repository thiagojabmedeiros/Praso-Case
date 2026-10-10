'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  DoorClosed,
  MapPin,
  Phone,
  PhoneCall,
  ShoppingCart,
  StickyNote,
  ThumbsDown,
  Trophy,
  UserPlus,
  UserX,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Establishment, Turno, Visit, VisitResult } from '@/lib/types';
import { establishmentsAPI, followupsAPI, visitsAPI } from '@/lib/api';
import { FornecimentosCard } from '@/components/fornecimentos-card';
import { BotaoGoogleMaps, BotaoWaze } from '@/components/botoes-navegacao';
import { IconeEnvio, IconeVoz } from '@/components/icones-animados';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  Desenha,
  EmptyState,
  ErroAviso,
  ListaSkeleton,
  PageHeader,
  cn,
  type Tom,
} from '@/components/ui';

// Ordem do funil: cadastro primeiro, depois a venda; no meio, os que ainda podem virar
// venda com nova tentativa; a recusa por último.
const RESULTADOS: { valor: VisitResult; rotulo: string; Icone: LucideIcon; tom: Tom }[] = [
  { valor: 'cadastrou', rotulo: 'Cadastrou', Icone: UserPlus, tom: 'success' },
  { valor: 'compra', rotulo: 'Compra', Icone: ShoppingCart, tom: 'success' },
  { valor: 'em-acompanhamento', rotulo: 'Acompanhar', Icone: PhoneCall, tom: 'primary' },
  { valor: 'ausente', rotulo: 'Ausente', Icone: UserX, tom: 'warning' },
  { valor: 'fechado', rotulo: 'Fechado', Icone: DoorClosed, tom: 'warning' },
  { valor: 'recusou', rotulo: 'Recusou', Icone: ThumbsDown, tom: 'danger' },
];

const SELECIONADO: Record<Tom, string> = {
  neutral: 'border-foreground bg-muted',
  primary: 'border-primary bg-primary-soft text-primary-text',
  success: 'border-success bg-success-soft text-success-text',
  warning: 'border-warning bg-warning-soft text-warning-text',
  danger: 'border-danger bg-danger-soft text-danger-text',
};

const TURNOS: { valor: Turno; rotulo: string }[] = [
  { valor: 'manha', rotulo: 'Manhã' },
  { valor: 'tarde', rotulo: 'Tarde' },
  { valor: 'noite', rotulo: 'Noite' },
];

const RESULTADOS_COM_RETORNO: VisitResult[] = ['cadastrou', 'em-acompanhamento', 'fechado', 'ausente'];

const STATUS: Record<string, { rotulo: string; tom: Tom }> = {
  lead: { rotulo: 'Lead', tom: 'danger' },
  oportunidade: { rotulo: 'Oportunidade', tom: 'warning' },
  cliente: { rotulo: 'Cliente', tom: 'success' },
  churn: { rotulo: 'Churn', tom: 'neutral' },
};

const CLASSE_CAMPO =
  'min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus:border-primary';

// Atraso da confirmação "Visita registrada" antes de voltar para a lista.
const ATRASO_CONFIRMACAO_MS = 450;

function Linha({ icone, rotulo, children }: { icone: ReactNode; rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="mt-0.5 text-muted-foreground">
        {icone}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{rotulo}</p>
        <div className="text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

const Pendente = () => <span className="font-normal italic text-muted-foreground">a levantar em campo</span>;

/** `atraso` escalona as seções que já estão na tela; as condicionais entram sem atraso. */
function Secao({ titulo, children, atraso = 0 }: { titulo: string; children: ReactNode; atraso?: number }) {
  return (
    <Card className="space-y-3 animate-fade-up" style={{ animationDelay: `${atraso}ms` }}>
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{titulo}</h2>
      {children}
    </Card>
  );
}

export default function VisitaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [resultado, setResultado] = useState<VisitResult | null>(null);
  const [nota, setNota] = useState('');
  const [proximoContato, setProximoContato] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [melhorTurno, setMelhorTurno] = useState<Turno | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [compraAutonoma, setCompraAutonoma] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [ouvindo, setOuvindo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  useEffect(() => {
    async function carregar() {
      try {
        setEstablishment(await establishmentsAPI.getById(params.id));
      } catch (err) {
        setErroCarga(err instanceof Error ? err.message : 'Erro ao carregar estabelecimento');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [params.id]);

  // Cliente que já bateu a meta de recorrência não recebe mais visitas.
  useEffect(() => {
    followupsAPI
      .getByEstablishment(params.id)
      .then((f) => setBloqueado(Boolean(f?.metaBatida)))
      .catch(() => setBloqueado(false));
  }, [params.id]);

  const iniciarNotaPorVoz = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErroForm('A nota por voz não está disponível neste navegador. Digite a nota.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const reconhecimento = new SpeechRecognition();
    reconhecimento.lang = 'pt-BR';
    reconhecimento.continuous = false;

    setOuvindo(true);
    setErroForm(null);
    reconhecimento.start();

    reconhecimento.onresult = (event: any) => {
      const texto = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setNota(texto);
      setOuvindo(false);
    };

    reconhecimento.onerror = () => {
      setOuvindo(false);
      setErroForm('Não foi possível captar o áudio. Digite a nota.');
    };
  };

  const registrar = async () => {
    if (!resultado) {
      setErroForm('Escolha o resultado da visita.');
      return;
    }
    if (resultado === 'compra' && !(Number(valorCompra) > 0)) {
      setErroForm('Informe o valor da compra.');
      return;
    }

    try {
      setEnviando(true);
      setErroForm(null);
      const visita: Visit = {
        id: '',
        establishmentId: params.id,
        vendedorId: 'seller-1',
        dataHora: new Date().toISOString(),
        tipo: 'efetiva',
        resultado,
        nota,
        proximoContato: proximoContato ? new Date(`${proximoContato}T12:00:00`).toISOString() : null,
        melhorTurno,
        compra: resultado === 'compra' ? { valor: Number(valorCompra), autonoma: compraAutonoma } : null,
        createdAt: new Date().toISOString(),
      };

      await visitsAPI.create(visita);
      // Confirma no próprio botão antes de voltar: o vendedor vê que o registro entrou.
      setEnviado(true);
      temporizador.current = setTimeout(() => router.push('/hoje'), ATRASO_CONFIRMACAO_MS);
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : 'Erro ao registrar a visita.');
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <>
        <PageHeader titulo="Visita" voltar={{ href: '/hoje', rotulo: 'Voltar para Hoje' }} />
        <ListaSkeleton itens={3} altura="h-40" />
      </>
    );
  }

  if (erroCarga || !establishment) {
    return (
      <>
        <PageHeader titulo="Visita" voltar={{ href: '/hoje', rotulo: 'Voltar para Hoje' }} />
        <ErroAviso mensagem={erroCarga || 'Estabelecimento não encontrado.'} />
      </>
    );
  }

  if (bloqueado) {
    return (
      <>
        <PageHeader
          titulo={establishment.nomeFantasia}
          voltar={{ href: '/carteira', rotulo: 'Voltar para a carteira' }}
        />
        <EmptyState
          icone={<Trophy aria-hidden="true" className="size-8 text-success-text" />}
          titulo="Meta de recorrência batida"
          descricao="Este cliente já fez as três compras autônomas. Visitas e compras estão bloqueadas."
          acao={<ButtonLink href="/carteira">Voltar para a carteira</ButtonLink>}
        />
      </>
    );
  }

  const status = STATUS[establishment.status] ?? STATUS.churn;
  const jaCadastrado = establishment.status !== 'lead';
  const resultadosVisiveis = RESULTADOS.filter((r) => r.valor !== 'cadastrou' || !jaCadastrado);
  const mostrarRetorno = resultado !== null && RESULTADOS_COM_RETORNO.includes(resultado);
  const hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        titulo={establishment.nomeFantasia}
        subtitulo={`${establishment.bairro} · ${establishment.segmento}`}
        voltar={{ href: '/hoje', rotulo: 'Voltar para Hoje' }}
        acao={<Badge tom={status.tom}>{status.rotulo}</Badge>}
      />

      <div className="space-y-4 p-4">
        {/* Contexto */}
        <Secao titulo="Contexto da visita">
          <div className="space-y-3">
            <Linha icone={<Phone className="size-4" />} rotulo="Telefone">
              {establishment.telefone ? (
                <a
                  href={`tel:${establishment.telefone.replace(/[^0-9+]/g, '')}`}
                  className="text-primary-text underline-offset-2 hover:underline"
                >
                  {establishment.telefone}
                </a>
              ) : (
                <Pendente />
              )}
            </Linha>
            <Linha icone={<MapPin className="size-4" />} rotulo="Endereço">
              {establishment.endereco}
            </Linha>
            <Linha icone={<Clock className="size-4" />} rotulo="Melhor horário">
              {establishment.melhorHorario ||
                (establishment.melhorTurno ? (
                  `turno da ${TURNOS.find((t) => t.valor === establishment.melhorTurno)?.rotulo.toLowerCase()}`
                ) : (
                  <Pendente />
                ))}
            </Linha>
            {establishment.notasContexto && (
              <Linha icone={<StickyNote className="size-4" />} rotulo="Notas">
                {establishment.notasContexto}
              </Linha>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <BotaoGoogleMaps destino={establishment} />
            <BotaoWaze destino={establishment} />
          </div>
        </Secao>

        {/* Fornecedores */}
        <Card className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <FornecimentosCard establishmentId={establishment.id} />
        </Card>

        {/* Resultado */}
        <Secao titulo="Resultado da visita" atraso={100}>
          {jaCadastrado && (
            <p className="flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2 text-sm font-semibold text-success-text">
              <UserPlus aria-hidden="true" className="size-4" />
              Já cadastrado na plataforma
            </p>
          )}
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Resultado da visita">
            {resultadosVisiveis.map(({ valor, rotulo, Icone, tom }) => {
              const ativo = resultado === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => {
                    setResultado(valor);
                    setErroForm(null);
                  }}
                  className={cn(
                    'flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-2 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-out-strong active:scale-95',
                    ativo ? SELECIONADO[tom] : 'border-border bg-card text-foreground hover:bg-muted',
                  )}
                >
                  {/* O wrapper externo segura a escala (transição); o interno remonta ao selecionar e redesenha o ícone. */}
                  <span
                    className={cn('inline-flex transition-transform duration-200 ease-out-strong', ativo && 'scale-110')}
                  >
                    <Desenha key={String(ativo)} ativo={ativo}>
                      <Icone aria-hidden="true" className="size-5" />
                    </Desenha>
                  </span>
                  {rotulo}
                </button>
              );
            })}
          </div>
        </Secao>

        {/* Dados da compra */}
        {resultado === 'compra' && (
          <Secao titulo="Dados da compra">
            <div>
              <label htmlFor="valor-compra" className="mb-1 block text-sm font-semibold text-foreground">
                Valor da compra (R$)
              </label>
              <input
                id="valor-compra"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={valorCompra}
                onChange={(e) => setValorCompra(e.target.value)}
                placeholder="0,00"
                className={CLASSE_CAMPO}
              />
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={compraAutonoma}
                onChange={(e) => setCompraAutonoma(e.target.checked)}
                className="size-5 accent-primary"
              />
              Comprou sozinho, sem apoio do vendedor
            </label>
          </Secao>
        )}

        {/* Retorno */}
        {mostrarRetorno && (
          <Secao titulo="Próximo contato">
            <div>
              <label htmlFor="retorno" className="mb-1 block text-sm font-semibold text-foreground">
                Data combinada para voltar
              </label>
              <input
                id="retorno"
                type="date"
                min={hoje}
                value={proximoContato}
                onChange={(e) => setProximoContato(e.target.value)}
                className={CLASSE_CAMPO}
              />
            </div>
          </Secao>
        )}

        {/* Turno */}
        <Secao titulo="Melhor turno para voltar" atraso={150}>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Melhor turno para voltar">
            {TURNOS.map((turno) => {
              const ativo = melhorTurno === turno.valor;
              return (
                <button
                  key={turno.valor}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setMelhorTurno(ativo ? null : turno.valor)}
                  className={cn(
                    'min-h-11 cursor-pointer rounded-xl border-2 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-out-strong active:scale-95',
                    ativo
                      ? 'border-primary bg-primary-soft text-primary-text'
                      : 'border-border bg-card text-foreground hover:bg-muted',
                  )}
                >
                  {turno.rotulo}
                </button>
              );
            })}
          </div>
        </Secao>

        {/* Nota */}
        <Secao titulo="Nota rápida" atraso={200}>
          <div>
            <label htmlFor="nota" className="mb-1 block text-sm font-semibold text-foreground">
              O que foi conversado
            </label>
            <textarea
              id="nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              placeholder="Ex.: dono interessado, combinou de voltar quinta"
              className={cn(CLASSE_CAMPO, 'py-2')}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Escutando: anel estático + cor + texto. Sem pulso em loop (não carrega informação extra). */}
            <Button
              variante="secondary"
              onClick={iniciarNotaPorVoz}
              disabled={ouvindo}
              className={ouvindo ? 'ring-2 ring-danger/60 disabled:opacity-100!' : undefined}
            >
              <IconeVoz ativo={ouvindo} className={cn('size-4', ouvindo && 'text-danger-text')} />
              {ouvindo ? 'Ouvindo…' : 'Ditar nota'}
            </Button>
            <Button variante="secondary" onClick={() => setNota('')} disabled={!nota}>
              <X aria-hidden="true" className="size-4" />
              Limpar
            </Button>
          </div>
        </Secao>
      </div>

      {/* Barra de envio fixa, acima da área segura */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-2xl space-y-2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          {erroForm && (
            <p
              key={erroForm}
              role="alert"
              className="animate-fade-up rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger-text"
            >
              {erroForm}
            </p>
          )}
          <Button
            tamanho="lg"
            cheio
            onClick={registrar}
            disabled={enviando}
            variante={enviado ? 'success' : 'primary'}
            className={enviado ? 'disabled:opacity-100!' : undefined}
          >
            {/* Um só SVG: o arco gira enquanto envia e vira check quando o registro entra. */}
            {(enviando || enviado) && (
              <IconeEnvio estado={enviado ? 'feito' : 'carregando'} className="size-5 animate-icon-in" />
            )}
            {enviado ? 'Visita registrada' : enviando ? 'Registrando…' : 'Registrar visita'}
          </Button>
        </div>
      </div>
    </>
  );
}
