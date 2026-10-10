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
 * Logo do Waze: silhueta oficial do balão (olhos, sorriso e rodas vazados). Branca, porque o botão
 * tem o azul da marca de fundo. Desenho do pacote Simple Icons (domínio público, CC0);
 * a marca "Waze" continua sendo da Waze Mobile Ltd.
 */
export function LogoWaze({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#ffffff"
        d="M13.218 0C9.915 0 6.835 1.49 4.723 4.148c-1.515 1.913-2.31 4.272-2.31 6.706v1.739c0 .894-.62 1.738-1.862 1.813-.298.025-.547.224-.547.522-.05.82.82 2.31 2.012 3.502.82.844 1.788 1.515 2.832 2.036a3 3 0 0 0 2.955 3.528 2.966 2.966 0 0 0 2.931-2.385h2.509c.323 1.689 2.086 2.856 3.974 2.21 1.64-.546 2.36-2.409 1.763-3.924a12.84 12.84 0 0 0 1.838-1.465 10.73 10.73 0 0 0 3.18-7.65c0-2.882-1.118-5.589-3.155-7.625A10.899 10.899 0 0 0 13.218 0zm0 1.217c2.558 0 4.967.994 6.78 2.807a9.525 9.525 0 0 1 2.807 6.78A9.526 9.526 0 0 1 20 17.585a9.647 9.647 0 0 1-6.78 2.807h-2.46a3.008 3.008 0 0 0-2.93-2.41 3.03 3.03 0 0 0-2.534 1.367v.024a8.945 8.945 0 0 1-2.41-1.788c-.844-.844-1.316-1.614-1.515-2.11a2.858 2.858 0 0 0 1.441-.846 2.959 2.959 0 0 0 .795-2.036v-1.789c0-2.11.696-4.197 2.012-5.861 1.863-2.385 4.62-3.726 7.6-3.726zm-2.41 5.986a1.192 1.192 0 0 0-1.191 1.192 1.192 1.192 0 0 0 1.192 1.193A1.192 1.192 0 0 0 12 8.395a1.192 1.192 0 0 0-1.192-1.192zm7.204 0a1.192 1.192 0 0 0-1.192 1.192 1.192 1.192 0 0 0 1.192 1.193 1.192 1.192 0 0 0 1.192-1.193 1.192 1.192 0 0 0-1.192-1.192zm-7.377 4.769a.596.596 0 0 0-.546.845 4.813 4.813 0 0 0 4.346 2.757 4.77 4.77 0 0 0 4.347-2.757.596.596 0 0 0-.547-.845h-.025a.561.561 0 0 0-.521.348 3.59 3.59 0 0 1-3.254 2.061 3.591 3.591 0 0 1-3.254-2.061.64.64 0 0 0-.546-.348z"
      />
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
