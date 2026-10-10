'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, LayoutDashboard, Target } from 'lucide-react';
import { cn } from '@/components/ui';

const ABAS = [
  { href: '/', label: 'Início', Icone: LayoutDashboard },
  { href: '/hoje', label: 'Hoje', Icone: CalendarCheck },
  { href: '/recorrencias', label: 'Recorrências', Icone: Target },
];

/**
 * Navegação principal com 3 destinos, num só componente:
 * - Abaixo de 1024px (mobile e tablet): barra inferior. Some nas telas de trabalho (visita e cliente),
 *   que têm barra própria.
 * - A partir de 1024px (`lg`): sidebar fixa à esquerda, sempre visível, em todas as telas.
 */
export function BottomNav() {
  const pathname = usePathname();
  // Mobile: só nas telas das abas. O indicador desliza até a aba ativa.
  const indiceAtivo = ABAS.findIndex((a) => a.href === pathname);
  const visivelNoMobile = indiceAtivo >= 0;
  // Sidebar: a aba "Hoje" também fica ativa em /hoje/resumo e /hoje/visitado/[id].
  const ativaNaLateral = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur',
        'lg:inset-y-0 lg:right-auto lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-t-0 lg:bg-card lg:backdrop-blur-none',
        !visivelNoMobile && 'max-lg:hidden',
      )}
    >
      {/* Marca: só na sidebar */}
      <div className="hidden items-center gap-3 px-6 pb-6 pt-7 lg:flex">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-on-primary"
        >
          P
        </span>
        <div className="leading-tight">
          <p className="text-lg font-extrabold tracking-tight text-foreground">Praso</p>
          <p className="text-xs font-medium text-muted-foreground">Plataforma de campo</p>
        </div>
      </div>

      <ul className="relative mx-auto flex max-w-2xl pb-[env(safe-area-inset-bottom)] lg:mx-0 lg:max-w-none lg:flex-col lg:gap-1 lg:px-3 lg:pb-0">
        {/* Indicador que desliza até a aba ativa (só no mobile). Transição, não keyframe: troca rápida retarget. */}
        {visivelNoMobile && (
          <li
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-0.5 transition-transform duration-300 ease-out-strong lg:hidden"
            style={{ width: `${100 / ABAS.length}%`, transform: `translateX(${indiceAtivo * 100}%)` }}
          >
            <span className="mx-auto block h-full w-10 rounded-full bg-primary" />
          </li>
        )}
        {ABAS.map(({ href, label, Icone }) => {
          const ativaMobile = pathname === href;
          const ativaLateral = ativaNaLateral(href);
          return (
            <li key={href} className="flex-1 lg:flex-none">
              <Link
                href={href}
                aria-current={ativaLateral ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-[color,background-color,transform] duration-150 ease-out-strong active:scale-95',
                  ativaMobile ? 'text-primary-text' : 'text-muted-foreground hover:text-foreground',
                  // Sidebar: linha com ícone e rótulo lado a lado, fundo na aba ativa.
                  'lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-xl lg:px-4 lg:text-sm',
                  ativaLateral
                    ? 'lg:bg-primary-soft lg:text-primary-text'
                    : 'lg:text-muted-foreground lg:hover:bg-muted lg:hover:text-foreground',
                )}
              >
                {/* O traço engrossa por CSS (stroke-width), então a troca de aba anima em vez de trocar de ícone. */}
                <Icone
                  aria-hidden="true"
                  className={cn(
                    'icone-aba size-6',
                    ativaMobile ? 'scale-110 stroke-[2.4]' : 'stroke-2',
                    ativaLateral ? 'lg:scale-100 lg:stroke-[2.4]' : 'lg:scale-100 lg:stroke-2',
                  )}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
