'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Establishment, Visit, Purchase } from '@/lib/types';
import { establishmentsAPI, visitsAPI, purchasesAPI } from '@/lib/api';

export default function ClientePage() {
  const params = useParams<{ id: string }>();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [est, vis, pur] = await Promise.all([
          establishmentsAPI.getById(params.id),
          visitsAPI.getByEstablishment(params.id),
          purchasesAPI.getByEstablishment(params.id),
        ]);
        setEstablishment(est);
        setVisits(vis);
        setPurchases(pur);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar cliente');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleAnular = async (visit: Visit) => {
    const motivo = window.prompt('Por que você está anulando esta visita?');
    if (!motivo || !motivo.trim()) return;
    try {
      const anulada = await visitsAPI.anular(visit.id, motivo.trim());
      setVisits((atual) => atual.map((v) => (v.id === visit.id ? anulada : v)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao anular visita');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600">Carregando histórico...</p>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">{error || 'Cliente não encontrado'}</div>
          <Link href="/carteira" className="mt-4 inline-block text-blue-600">
            ← Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/carteira" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{establishment.nomeFantasia}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Info */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3">ℹ️ Informações</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-600">CNPJ:</span>{' '}
              <span className="font-mono">{establishment.cnpj}</span>
            </p>
            <p>
              <span className="text-slate-600">Endereço:</span> {establishment.endereco}
            </p>
            <p>
              <span className="text-slate-600">Segmento:</span> {establishment.segmento}
            </p>
            <p>
              <span className="text-slate-600">Fornecedor atual:</span> {establishment.fornecedorAtual}
            </p>
          </div>
        </div>

        {/* Compras */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3">
            🛒 Compras ({purchases.length})
          </h2>
          {purchases.length === 0 ? (
            <p className="text-slate-600 text-sm">Nenhuma compra registrada</p>
          ) : (
            <div className="space-y-2">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(purchase.data).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-600">
                      {purchase.autonoma ? '✅ Autônoma' : '👨 Com apoio'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      R$ {purchase.valor.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visitas */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3">
            📍 Histórico de Visitas ({visits.length})
          </h2>
          {visits.length === 0 ? (
            <p className="text-slate-600 text-sm">Nenhuma visita registrada</p>
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className={`p-3 rounded border border-slate-200 ${visit.anuladaEm ? 'bg-slate-100 opacity-60' : 'bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(visit.dataHora).toLocaleDateString('pt-BR')}{' '}
                      {new Date(visit.dataHora).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {visit.tipo === 'efetiva' ? '✅ Efetiva' : '📅 Planejada'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    Resultado: {visit.resultado}
                  </p>
                  {visit.nota && (
                    <p className="text-sm text-slate-600">
                      <strong>Nota:</strong> {visit.nota}
                    </p>
                  )}
                  {visit.proximoContato && !visit.anuladaEm && (
                    <p className="text-xs text-slate-600 mt-1">
                      📅 Próximo contato: {new Date(visit.proximoContato).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  {visit.anuladaEm ? (
                    <p className="text-xs text-red-700 mt-2">
                      Anulada em {new Date(visit.anuladaEm).toLocaleDateString('pt-BR')}: {visit.motivoAnulacao}
                    </p>
                  ) : (
                    <button
                      onClick={() => handleAnular(visit)}
                      className="mt-2 text-xs text-red-700 hover:underline"
                    >
                      Anular visita
                    </button>
                  )}
                  {visit.geo && (
                    <p className="text-xs text-slate-500 mt-1">
                      📍 {visit.geo.lat.toFixed(4)}, {visit.geo.lng.toFixed(4)} (±{Math.round(visit.geo.accuracy || 0)}m)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
