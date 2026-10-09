import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-md mx-auto mt-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Praso Vendedor</h1>
        <p className="text-slate-300 mb-8">Plataforma de campo para vendedores B2B</p>

        <div className="space-y-4">
          <Link
            href="/hoje"
            className="block w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
          >
            📅 Carteira do Dia
          </Link>
          <Link
            href="/carteira"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-semibold transition"
          >
            🎯 Acompanhamento (Recorrência)
          </Link>
        </div>

        <div className="mt-12 text-sm text-slate-400">
          <p>Vendedor: João da Silva (ID: seller-1)</p>
        </div>
      </div>
    </div>
  );
}
