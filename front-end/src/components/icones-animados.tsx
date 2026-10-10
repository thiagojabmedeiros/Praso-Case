import { Mic } from 'lucide-react';
import { cn } from '@/components/ui';

/**
 * Ícone do botão de envio: um só SVG que vai de "carregando" a "feito".
 * Carregando: arco girando. Feito: o arco fecha o círculo e o check se desenha.
 * A troca é por transição CSS (ver `.icone-envio` em globals.css), então um estado
 * que muda no meio do caminho é retomado sem salto.
 */
export function IconeEnvio({ estado, className }: { estado: 'carregando' | 'feito'; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      data-estado={estado}
      className={cn('icone-envio', className)}
    >
      <circle className="icone-envio__anel" cx="12" cy="12" r="9" pathLength="1" />
      <path className="icone-envio__check" d="M7.8 12.4l3 3 5.6-6.2" pathLength="1" />
    </svg>
  );
}

/**
 * Microfone que vira ondas sonoras enquanto escuta. As ondas só existem no estado
 * "escutando": não é movimento decorativo, é o indicador de que o áudio está sendo captado.
 */
export function IconeVoz({ ativo, className }: { ativo: boolean; className?: string }) {
  if (!ativo) return <Mic aria-hidden="true" className={className} />;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      className={cn('icone-voz animate-icon-in', className)}
    >
      <line x1="6" y1="8.5" x2="6" y2="15.5" />
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
      <line x1="18" y1="8.5" x2="18" y2="15.5" />
    </svg>
  );
}
