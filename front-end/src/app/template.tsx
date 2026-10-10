/** Remonta a cada navegação: a nova tela entra com um fade curto. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
