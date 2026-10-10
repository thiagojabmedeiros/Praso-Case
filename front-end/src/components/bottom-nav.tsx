'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, LayoutDashboard, Target } from 'lucide-react';

const ABAS = [
  { href: '/', label: 'Início', Icone: LayoutDashboard },
  { href: '/hoje', label: 'Hoje', Icone: CalendarCheck },
  { href: '/carteira', label: 'Carteira', Icone: Target },
];

/** Navegação inferior com 3 destinos. Some nas telas de trabalho (visita e cliente), que têm barra própria. */
export function BottomNav() {
  const pathname = usePathname();
  const indiceAtivo = ABAS.findIndex((a) => a.href === pathname);
  if (indiceAtivo < 0) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur"
    >
      <ul className="relative mx-auto flex max-w-2xl pb-[env(safe-area-inset-bottom)]">
        {/* Indicador que desliza até a aba ativa */}
        <li
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-0.5 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ width: `${100 / ABAS.length}%`, transform: `translateX(${indiceAtivo * 100}%)` }}
        >
          <span className="mx-auto block h-full w-10 rounded-full bg-primary" />
        </li>
        {ABAS.map(({ href, label, Icone }) => {
          const ativa = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={ativa ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-[color,transform] duration-150 active:scale-90 ${
                  ativa ? 'text-primary-text' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icone
                  key={String(ativa)}
                  aria-hidden="true"
                  className={`size-6 ${ativa ? 'animate-pop' : ''}`}
                  strokeWidth={ativa ? 2.4 : 2}
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
