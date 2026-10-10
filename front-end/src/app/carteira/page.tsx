'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FollowUp, Establishment } from '@/lib/types';
import { followupsAPI, establishmentsAPI } from '@/lib/api';

const urgencyColor = {
  vencida: 'bg-red-100 text-red-800 border-red-300',
  critica: 'bg-orange-100 text-orange-800 border-orange-300',
  normal: 'bg-blue-100 text-blue-800 border-blue-300',
};

const urgencyLabel = {
  vencida: '⚠️ Vencida',
  critica: '🔥 Crítica',
  normal: '⏳ Normal',
};

export default function CarteiraPage() {
  const [followups, setFollowups] = useState<(FollowUp & { establishment?: Establishment })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await followupsAPI.getByVendedor('seller-1');

        // Enriquece com dados de establishment
        const enriched = await Promise.all(
          data.map(async (followup) => {
            try {
              const est = await establishmentsAPI.getById(followup.establishmentId);
              return { ...followup, establishment: est };
            } catch {
              return followup;
            }
          }),
        );

        setFollowups(enriched);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar carteira');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // A compra agora é registrada pela visita (ver /visita/[id]).
  const handleContato = () => {
    alert('Contato registrado com o cliente');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600">Carregando carteira de acompanhamento...</p>
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
          <h1 className="text-2xl font-bold text-slate-900">🎯 Acompanhamento (Recorrência)</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Voltar
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-2xl mx-auto p-4 grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
          <p className="text-3xl font-bold text-slate-900">{followups.length}</p>
          <p className="text-xs text-slate-600 mt-1">Em Acompanhamento</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
          <p className="text-3xl font-bold text-orange-600">
            {followups.filter((f) => f.urgencia === 'critica' || f.urgencia === 'vencida').length}
          </p>
          <p className="text-xs text-slate-600 mt-1">Urgentes</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
          <p className="text-3xl font-bold text-emerald-600">
            {followups.reduce((sum, f) => sum + (f.comprasAte ?? 0), 0)}
          </p>
          <p className="text-xs text-slate-600 mt-1">Compras Autônomas</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {followups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Nenhum cliente em acompanhamento 🎉</p>
          </div>
        ) : (
          followups.map((followup) => (
            <Link key={followup.establishmentId} href={`/cliente/${followup.establishmentId}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 cursor-pointer">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg text-slate-900 truncate">
                      {followup.establishment?.nomeFantasia || followup.establishmentId}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {followup.establishment?.razaoSocial}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border-2 ${urgencyColor[followup.urgencia]}`}
                  >
                    {urgencyLabel[followup.urgencia]}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">
                      {followup.comprasAte}/3 compras autônomas
                    </span>
                    <span className="text-xs text-slate-600">
                      {followup.diasRestantes} dias restantes
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        followup.faltam === 0
                          ? 'bg-emerald-600'
                          : followup.urgencia === 'vencida'
                            ? 'bg-red-600'
                            : followup.urgencia === 'critica'
                              ? 'bg-orange-600'
                              : 'bg-blue-600'
                      }`}
                      style={{ width: `${((3 - followup.faltam) / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="mb-3 text-xs text-slate-600">
                  <p>1ª compra: {new Date(followup.primeiraCompraData).toLocaleDateString('pt-BR')}</p>
                  <p>Última compra: {new Date(followup.ultimaCompraData).toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleContato();
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm py-2 rounded transition"
                  >
                    📞 Contato
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
