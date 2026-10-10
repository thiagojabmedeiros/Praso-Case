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

// Logo do Waze: ícone da UXWing (uxwing.com/waze-icon), livre para uso comercial sem atribuição.
// A marca "Waze" continua sendo da Waze Mobile Ltd.
const WAZE = {
  miolo:
    'M55.14,104.21c4.22,0,8.44,0.19,12.66-0.09c3.84-0.19,7.88-0.56,11.63-1.5c29.82-7.31,45.76-40.23,32.72-68.07 C104.27,17.76,90.77,8.19,72.3,6.22c-14.16-1.5-26.82,2.72-37.51,12.28c-10.5,9.47-15.94,21.28-16.31,35.44 c-0.09,3.28,0,6.66,0,9.94C18.38,71.02,14.35,76.55,7.5,78.7c-0.09,0-0.28,0.19-0.38,0.19c2.63,6.94,13.31,17.16,19.97,19.69 C35.45,87.14,52.32,91.18,55.14,104.21L55.14,104.21z',
  contorno:
    'M54.95,110.49c-1.03,4.69-3.56,8.16-7.69,10.31c-5.25,2.72-10.6,2.63-15.57-0.56c-5.16-3.28-7.41-8.25-7.03-14.35 c0.09-1.03-0.19-1.41-1.03-1.88c-9.1-4.78-16.31-11.44-21.28-20.44c-0.94-1.78-1.69-3.66-2.16-5.63c-0.66-2.72,0.38-4.03,3.19-4.31 c3.38-0.38,6.38-1.69,7.88-4.88c0.66-1.41,1.03-3.09,1.03-4.69c0.19-4.03,0-8.06,0.19-12.1c1.03-15.57,7.5-28.5,19.32-38.63 C42.67,3.97,55.42-0.43,69.76,0.03c25.04,0.94,46.51,18.57,51.57,43.23c4.59,22.32-2.34,40.98-20.07,55.51 c-1.03,0.84-2.16,1.69-3.38,2.44c-0.66,0.47-0.84,0.84-0.56,1.59c2.34,7.13-0.94,15-7.5,18.38c-8.91,4.41-19.22-0.09-21.94-9.66 c-0.09-0.38-0.56-0.84-0.84-0.84C63.11,110.4,59.07,110.49,54.95,110.49L54.95,110.49z M55.14,104.21c4.22,0,8.44,0.19,12.66-0.09 c3.84-0.19,7.88-0.56,11.63-1.5c29.82-7.31,45.76-40.23,32.72-68.07C104.27,17.76,90.77,8.19,72.3,6.22 c-14.16-1.5-26.82,2.72-37.51,12.28c-10.5,9.47-15.94,21.28-16.31,35.44c-0.09,3.28,0,6.66,0,9.94 C18.38,71.02,14.35,76.55,7.5,78.7c-0.09,0-0.28,0.19-0.38,0.19c2.63,6.94,13.31,17.16,19.97,19.69 C35.45,87.14,52.32,91.18,55.14,104.21L55.14,104.21z',
  sorriso:
    'M74.92,79.74c-11.07-0.56-18.38-4.97-23.07-13.78c-1.13-2.16-0.09-4.31,2.06-4.78c1.31-0.28,2.53,0.66,3.47,2.16 c1.22,1.88,2.44,3.75,4.03,5.25c8.81,8.34,23.25,5.72,28.79-5.06c0.66-1.31,1.5-2.34,3.09-2.34c2.34,0.09,3.66,2.44,2.63,4.59 c-2.91,5.91-7.5,10.22-13.69,12.28C79.51,78.99,76.7,79.36,74.92,79.74L74.92,79.74z',
  olhoEsquerdo:
    'M55.32,48.98c-3.38,0-6.09-2.72-6.09-6.09s2.72-6.09,6.09-6.09s6.09,2.72,6.09,6.09C61.42,46.17,58.7,48.98,55.32,48.98 L55.32,48.98z',
  olhoDireito:
    'M98.27,42.79c0,3.38-2.72,6.09-6,6.19c-3.38,0-6.09-2.63-6.09-6.09c0-3.38,2.63-6.09,6-6.19 C95.46,36.7,98.17,39.42,98.27,42.79L98.27,42.79z',
};

/** Logo do Waze: balão branco por dentro, com contorno, olhos, sorriso e rodas pretos. */
export function LogoWaze({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 122.71 122.88" aria-hidden="true" className={className}>
      <path fill="#ffffff" d={WAZE.miolo} />
      <path fill="#000000" d={WAZE.contorno} />
      <path fill="#000000" d={WAZE.sorriso} />
      <path fill="#000000" d={WAZE.olhoEsquerdo} />
      <path fill="#000000" d={WAZE.olhoDireito} />
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
