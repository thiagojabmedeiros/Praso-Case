'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

export function cn(...partes: (string | false | null | undefined)[]) {
  return partes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ Card */

export function Card({
  className,
  interativo = false,
  ...props
}: ComponentProps<'div'> & { interativo?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-4 shadow-sm',
        // Cartão clicável: afunda um pouco ao toque, como um botão.
        interativo && 'transition-[background-color,transform] duration-150 ease-out hover:bg-muted active:scale-[0.98]',
        className,
      )}
      {...props}
    />
  );
}

/* ----------------------------------------------------------------- Badge */

export type Tom = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONS: Record<Tom, string> = {
  neutral: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-soft text-primary-text',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  danger: 'bg-danger-soft text-danger-text',
};

/** Selo de status. Sempre leva texto: a cor sozinha nunca carrega o significado. */
export function Badge({
  tom = 'neutral',
  icone,
  className,
  children,
}: {
  tom?: Tom;
  icone?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
        TONS[tom],
        className,
      )}
    >
      {icone}
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Botões */

type Variante = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
type Tamanho = 'md' | 'lg';

const VARIANTES: Record<Variante, string> = {
  primary: 'bg-primary text-on-primary hover:brightness-110 active:brightness-90',
  success: 'bg-success text-on-success hover:brightness-110 active:brightness-90',
  danger: 'bg-danger text-on-danger hover:brightness-110 active:brightness-90',
  secondary: 'bg-muted text-foreground hover:bg-border active:bg-border',
  outline: 'border border-input text-foreground hover:bg-muted active:bg-muted',
  ghost: 'text-primary-text hover:bg-primary-soft active:bg-primary-soft',
};

// Alvos de toque de no mínimo 44px; feedback por cor/brilho, sem mexer no layout.
const TAMANHOS: Record<Tamanho, string> = {
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

export function buttonClasses({
  variante = 'primary',
  tamanho = 'md',
  cheio = false,
  className,
}: {
  variante?: Variante;
  tamanho?: Tamanho;
  cheio?: boolean;
  className?: string;
} = {}) {
  return cn(
    'inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-xl font-semibold',
    'transition-[background-color,filter,opacity,transform] duration-150 ease-out',
    'active:scale-[0.97]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTES[variante],
    TAMANHOS[tamanho],
    cheio && 'w-full',
    className,
  );
}

export function Button({
  variante,
  tamanho,
  cheio,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { variante?: Variante; tamanho?: Tamanho; cheio?: boolean }) {
  return <button type={type} className={buttonClasses({ variante, tamanho, cheio, className })} {...props} />;
}

export function ButtonLink({
  variante,
  tamanho,
  cheio,
  className,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante; tamanho?: Tamanho; cheio?: boolean }) {
  return <Link className={buttonClasses({ variante, tamanho, cheio, className })} {...props} />;
}

/* ---------------------------------------------------------------- Cabeçalho */

/** Cabeçalho fixo no topo, respeitando a área segura do celular. */
export function PageHeader({
  titulo,
  subtitulo,
  voltar,
  acao,
}: {
  titulo: string;
  subtitulo?: string;
  voltar?: { href: string; rotulo: string };
  acao?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex min-h-16 items-center gap-2 px-4 py-2">
        {voltar && (
          <Link
            href={voltar.href}
            aria-label={voltar.rotulo}
            className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:scale-90 active:scale-90"
          >
            <ChevronLeft aria-hidden="true" className="size-6" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-xl font-extrabold leading-tight tracking-tight text-foreground">{titulo}</h1>
          {subtitulo && <p className="truncate text-sm text-muted-foreground">{subtitulo}</p>}
        </div>
        {acao}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------- Estatística */

/** Número que sobe até o valor final. Sem movimento para quem pediu menos animação. */
export function Numero({ valor, duracao = 700 }: { valor: number; duracao?: number }) {
  const [exibido, setExibido] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const de = anterior.current;
    anterior.current = valor;
    if (reduzido || de === valor) {
      setExibido(valor);
      return;
    }
    let quadro = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - t, 4); // ease-out quártico
      setExibido(Math.round(de + (valor - de) * suave));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor, duracao]);

  return <>{exibido.toLocaleString('pt-BR')}</>;
}

export function StatTile({
  valor,
  rotulo,
  tom = 'neutral',
}: {
  valor: ReactNode;
  rotulo: string;
  tom?: Tom;
}) {
  const cor: Record<Tom, string> = {
    neutral: 'text-foreground',
    primary: 'text-primary-text',
    success: 'text-success-text',
    warning: 'text-warning-text',
    danger: 'text-danger-text',
  };
  return (
    <Card className="px-2 py-3 text-center">
      <p className={cn('text-2xl font-extrabold tabular-nums', cor[tom])}>
        {typeof valor === 'number' ? <Numero valor={valor} /> : valor}
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{rotulo}</p>
    </Card>
  );
}

/* ----------------------------------------------------------------- Estados */

export function EmptyState({
  icone,
  titulo,
  descricao,
  acao,
}: {
  icone: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex animate-fade-in flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex size-16 animate-pop items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icone}
      </div>
      <h2 className="text-lg font-bold text-foreground">{titulo}</h2>
      {descricao && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-shimmer rounded-xl bg-muted', className)} />;
}

/** Lista de cartões esqueleto: reserva espaço enquanto carrega, evitando salto de layout. */
export function ListaSkeleton({ itens = 3, altura = 'h-44' }: { itens?: number; altura?: string }) {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Carregando">
      {Array.from({ length: itens }).map((_, i) => (
        <Skeleton key={i} className={altura} />
      ))}
    </div>
  );
}

export function ErroAviso({ mensagem }: { mensagem: string }) {
  return (
    <div role="alert" className="m-4 animate-shake rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger-text">
      {mensagem}
    </div>
  );
}

/* ------------------------------------------------------------------- Barra */

/** Preenchimento de barra: cresce por transform (barato) a partir da esquerda. */
export function Preenchimento({
  porcentagem,
  className,
  atraso = 0,
}: {
  porcentagem: number;
  className?: string;
  atraso?: number;
}) {
  return (
    <div
      className={cn('h-full origin-left animate-fill rounded-full', className)}
      style={{ width: `${porcentagem}%`, animationDelay: `${atraso}ms` }}
    />
  );
}
