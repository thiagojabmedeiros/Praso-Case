/**
 * Remonta a cada navegação: a nova tela entra com um fade de 140ms.
 * Só opacidade (sem transform/filter), para não criar bloco de contenção
 * para a barra fixa da tela de visita.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
