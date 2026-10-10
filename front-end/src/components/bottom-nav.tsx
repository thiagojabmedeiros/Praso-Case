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
  if (!ABAS.some((a) => a.href === pathname)) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-2xl pb-[env(safe-area-inset-bottom)]">
        {ABAS.map(({ href, label, Icone }) => {
          const ativa = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={ativa ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
                  ativa ? 'text-primary-text' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icone aria-hidden="true" className="size-6" strokeWidth={ativa ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
