'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Establishment } from '@/lib/types';
import { establishmentsAPI } from '@/lib/api';

const statusLabel = {
  lead: '🔴 Lead',
  oportunidade: '🟡 Oportunidade',
  cliente: '🟢 Cliente',
  churn: '⚫ Churn',
};

const statusColor = {
  lead: 'bg-red-100 text-red-800',
  oportunidade: 'bg-yellow-100 text-yellow-800',
  cliente: 'bg-green-100 text-green-800',
  churn: 'bg-gray-100 text-gray-800',
};

export default function HojePage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await establishmentsAPI.getAll({
          status: 'lead',
        });
        setEstablishments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estabelecimentos');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Carregando carteira do dia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">Erro: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">📅 Carteira do Dia</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Voltar
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {establishments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Nenhum estabelecimento encontrado</p>
          </div>
        ) : (
          establishments.map((est) => (
            <Link key={est.id} href={`/visita/${est.id}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-slate-900 truncate">
                      {est.nomeFantasia}
                    </h2>
                    <p className="text-sm text-slate-600">{est.razaoSocial}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      📍 {est.bairro} • {est.segmento}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor[est.status]}`}
                  >
                    {statusLabel[est.status]}
                  </span>
                </div>

                {/* Quick info */}
                <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Melhor horário:</span>
                    <p className="font-medium text-slate-900">{est.melhorHorario}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Potencial:</span>
                    <p className="font-medium text-slate-900">
                      {est.potencial === 'alto' ? '⭐ Alto' : 'Normal'}
                    </p>
                  </div>
                </div>

                {/* Fornecedor */}
                <div className="mt-2 text-xs">
                  <span className="text-slate-500">Fornecedor atual:</span>
                  <p className="text-slate-700">{est.fornecedorAtual}</p>
                </div>

                {/* CTA */}
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded transition">
                    Iniciar Visita
                  </button>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(est.endereco)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm py-2 rounded transition text-center"
                  >
                    Mapas
                  </a>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
