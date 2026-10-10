import { useId } from 'react';
import { buttonClasses, cn } from '@/components/ui';

/**
 * Logo do Google Maps (pin em quatro cores). Desenho simplificado em SVG inline:
 * cada setor do pin é recortado por um polígono a partir do centro.
 */
export function LogoGoogleMaps({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <path
          id={`${id}-pin`}
          d="M12 1.5a7.5 7.5 0 0 0-7.5 7.5c0 5.2 7.5 13.5 7.5 13.5s7.5-8.3 7.5-13.5A7.5 7.5 0 0 0 12 1.5z"
        />
        <clipPath id={`${id}-topo`}>
          <polygon points="12,9 -20,-23 44,-23" />
        </clipPath>
        <clipPath id={`${id}-direita`}>
          <polygon points="12,9 44,-23 44,41" />
        </clipPath>
        <clipPath id={`${id}-base`}>
          <polygon points="12,9 44,41 -20,41" />
        </clipPath>
        <clipPath id={`${id}-esquerda`}>
          <polygon points="12,9 -20,41 -20,-23" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-topo)`}>
        <use href={`#${id}-pin`} fill="#ea4335" />
      </g>
      <g clipPath={`url(#${id}-direita)`}>
        <use href={`#${id}-pin`} fill="#fbbc04" />
      </g>
      <g clipPath={`url(#${id}-base)`}>
        <use href={`#${id}-pin`} fill="#34a853" />
      </g>
      <g clipPath={`url(#${id}-esquerda)`}>
        <use href={`#${id}-pin`} fill="#4285f4" />
      </g>
      <circle cx="12" cy="9" r="3" fill="#ffffff" />
    </svg>
  );
}

/**
 * Logo do Waze: balão com carinha. Branca, porque o botão tem o azul da marca de fundo.
 * Desenho simplificado em SVG inline.
 */
export function LogoWaze({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2.5c-4.9 0-8.8 3.6-8.8 8.1 0 2 .8 3.9 2.2 5.3-.1 1-.6 2.2-1.6 3 1.8 0 3.2-.7 4.2-1.5 1.2.4 2.5.6 4 .6 4.9 0 8.8-3.6 8.8-8.1S16.9 2.5 12 2.5z"
        fill="#ffffff"
      />
      <circle cx="9.1" cy="9.3" r="1.15" fill="#05283a" />
      <circle cx="14.9" cy="9.3" r="1.15" fill="#05283a" />
      <path
        d="M8.6 12.4c.9 1.5 2.1 2.2 3.4 2.2s2.5-.7 3.4-2.2"
        fill="none"
        stroke="#05283a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="8.3" cy="20.2" r="1.7" fill="#05283a" stroke="#ffffff" strokeWidth="1.1" />
      <circle cx="15.7" cy="20.2" r="1.7" fill="#05283a" stroke="#ffffff" strokeWidth="1.1" />
    </svg>
  );
}

type Destino = { latitude?: number | null; longitude?: number | null; endereco: string };

const temCoordenadas = (d: Destino) => d.latitude != null && d.longitude != null;

/** Abre o destino no Google Maps (por coordenadas; sem elas, pelo endereço). */
export function BotaoGoogleMaps({
  destino,
  rotulo = 'Google Maps',
  className,
}: {
  destino: Destino;
  rotulo?: string;
  className?: string;
}) {
  const consulta = temCoordenadas(destino)
    ? `${destino.latitude},${destino.longitude}`
    : encodeURIComponent(destino.endereco);
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${consulta}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir no Google Maps"
      className={buttonClasses({ variante: 'maps', className })}
    >
      <LogoGoogleMaps className="size-5 shrink-0" />
      {rotulo}
    </a>
  );
}

/** Abre a rota no Waze. Só com coordenadas; sem elas o botão fica indisponível, na cor da marca esmaecida. */
export function BotaoWaze({ destino, className }: { destino: Destino; className?: string }) {
  const conteudo = (
    <>
      <LogoWaze className="size-5 shrink-0" />
      Waze
    </>
  );

  if (!temCoordenadas(destino)) {
    return (
      <span
        aria-disabled="true"
        aria-label="Waze (sem coordenadas cadastradas)"
        className={buttonClasses({ variante: 'waze', className: cn('opacity-50 grayscale', className) })}
      >
        {conteudo}
      </span>
    );
  }

  return (
    <a
      href={`https://waze.com/ul?ll=${destino.latitude},${destino.longitude}&navigate=yes`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir no Waze"
      className={buttonClasses({ variante: 'waze', className })}
    >
      {conteudo}
    </a>
  );
}
