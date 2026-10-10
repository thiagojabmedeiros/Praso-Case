import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// O zoom fica liberado (acessibilidade). viewportFit cobre as áreas seguras do celular.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export const metadata: Metadata = {
  title: "Praso Vendedor",
  description: "Plataforma de campo para vendedores B2B de foodservice",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Praso",
  },
};

const ICONE =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect fill='%233b61ba' width='180' height='180' rx='40'/><text x='90' y='122' font-size='104' font-weight='800' font-family='sans-serif' fill='white' text-anchor='middle'>P</text></svg>";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href={ICONE} />
        <link rel="apple-touch-icon" href={ICONE} />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Pular para o conteúdo
        </a>
        {/* Mobile: coluna única de até 2xl com a barra inferior. Desktop (lg): deixa 16rem para a sidebar e
            usa uma área de conteúdo mais larga e centralizada. */}
        <main id="conteudo" className="flex-1 lg:pl-64">
          <div className="mx-auto w-full max-w-2xl pb-28 lg:max-w-6xl lg:pb-10">{children}</div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
