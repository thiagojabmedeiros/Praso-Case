'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Establishment, Turno, Visit, VisitResult } from '@/lib/types';
import { establishmentsAPI, followupsAPI, visitsAPI } from '@/lib/api';

const visitResults: { value: VisitResult; label: string; emoji: string }[] = [
  { value: 'cadastrou', label: 'Cadastrou', emoji: '✅' },
  { value: 'recusou', label: 'Recusou', emoji: '❌' },
  { value: 'fechado', label: 'Fechado', emoji: '🚪' },
  { value: 'ausente', label: 'Ausente', emoji: '😴' },
  { value: 'compra', label: 'Compra', emoji: '🛒' },
  { value: 'em-acompanhamento', label: 'Acompanhamento', emoji: '📞' },
];

export default function VisitaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<VisitResult | null>(null);
  const [note, setNote] = useState('');
  const [proximoContato, setProximoContato] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [melhorTurno, setMelhorTurno] = useState<Turno | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [compraAutonoma, setCompraAutonoma] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useVoice, setUseVoice] = useState(false);
  const [listeningVoice, setListeningVoice] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await establishmentsAPI.getById(params.id);
        setEstablishment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estabelecimento');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  // Cliente que já bateu a meta de recorrência não recebe mais visitas.
  useEffect(() => {
    followupsAPI
      .getByEstablishment(params.id)
      .then((f) => setBloqueado(Boolean(f?.metaBatida)))
      .catch(() => setBloqueado(false));
  }, [params.id]);

  const startVoiceNote = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voz não disponível neste navegador');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    setListeningVoice(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setNote(transcript);
      setListeningVoice(false);
    };

    recognition.onerror = () => {
      setListeningVoice(false);
      setError('Erro ao capturar áudio');
    };
  };

  const handleSubmit = async () => {
    if (!selectedResult) {
      setError('Selecione um resultado');
      return;
    }

    if (selectedResult === 'compra' && !(Number(valorCompra) > 0)) {
      setError('Informe o valor da compra');
      return;
    }

    try {
      setIsSubmitting(true);
      const visitData: Visit = {
        id: '',
        establishmentId: params.id,
        vendedorId: 'seller-1',
        dataHora: new Date().toISOString(),
        tipo: 'efetiva',
        resultado: selectedResult,
        nota: note,
        proximoContato: proximoContato ? new Date(`${proximoContato}T12:00:00`).toISOString() : null,
        melhorTurno,
        compra: selectedResult === 'compra' ? { valor: Number(valorCompra), autonoma: compraAutonoma } : null,
        createdAt: new Date().toISOString(),
      };

      await visitsAPI.create(visitData);
      router.push('/hoje');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar visita');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    );
  }

  if (bloqueado) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Link href="/carteira" className="text-sm text-blue-600 hover:underline inline-block">
            ← Voltar para carteira
          </Link>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-lg">
            <h1 className="font-semibold text-lg">🏆 {establishment?.nomeFantasia ?? 'Cliente'} já bateu a meta</h1>
            <p className="text-sm mt-1">
              Três compras autônomas registradas. Visitas e compras estão bloqueadas para este cliente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            {error || 'Estabelecimento não encontrado'}
          </div>
          <Link href="/hoje" className="mt-4 inline-block text-blue-600">
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
          <Link href="/hoje" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{establishment.nomeFantasia}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Cartão de contexto */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-slate-900 mb-3">📋 Contexto da Visita</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-600">Segmento:</span>{' '}
              <span className="font-medium">{establishment.segmento}</span>
            </p>
            <p>
              <span className="text-slate-600">Telefone:</span>{' '}
              {establishment.telefone ? (
                <a href={`tel:${establishment.telefone.replace(/[^0-9]/g, '')}`} className="font-medium text-blue-600">
                  {establishment.telefone}
                </a>
              ) : (
                <span className="font-medium text-slate-500">a levantar em campo</span>
              )}
            </p>
            <p>
              <span className="text-slate-600">Endereço:</span>{' '}
              <span className="font-medium">{establishment.endereco}</span>
            </p>
            <p>
              <span className="text-slate-600">Fornecedor atual:</span>{' '}
              <span className={establishment.fornecedorAtual ? 'font-medium' : 'font-medium text-slate-500'}>
                {establishment.fornecedorAtual ?? 'a levantar em campo'}
              </span>
            </p>
            <p>
              <span className="text-slate-600">Melhor horário:</span>{' '}
              <span className={establishment.melhorHorario ? 'font-medium' : 'font-medium text-slate-500'}>
                {establishment.melhorHorario ?? 'a levantar em campo'}
              </span>
            </p>
            <p>
              <span className="text-slate-600">Melhor turno:</span>{' '}
              <span className={establishment.melhorTurno ? 'font-medium' : 'font-medium text-slate-500'}>
                {establishment.melhorTurno ? { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }[establishment.melhorTurno] : 'a levantar em campo'}
              </span>
            </p>
            {establishment.notasContexto && (
              <p>
                <span className="text-slate-600">Notas:</span>{' '}
                <span className="font-medium">{establishment.notasContexto}</span>
              </p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <a
              href={
                establishment.latitude != null && establishment.longitude != null
                  ? `https://www.google.com/maps/search/?api=1&query=${establishment.latitude},${establishment.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(establishment.endereco)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm py-2 rounded transition"
            >
              Abrir no Google Maps
            </a>
            {establishment.latitude != null && establishment.longitude != null && (
              <a
                href={`https://waze.com/ul?ll=${establishment.latitude},${establishment.longitude}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm py-2 rounded transition"
              >
                Abrir no Waze
              </a>
            )}
          </div>
        </div>

        {/* Resultado da visita */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-semibold text-slate-900 mb-3">✅ Resultado da Visita</h2>
          {establishment.status !== 'lead' && (
            <p className="mb-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-900 rounded px-3 py-2">
              ✅ Já cadastrado na plataforma
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {visitResults
              .filter((result) => result.value !== 'cadastrou' || establishment.status === 'lead')
              .map((result) => (
              <button
                key={result.value}
                onClick={() => setSelectedResult(result.value)}
                className={`p-3 rounded-lg text-sm font-medium transition ${
                  selectedResult === result.value
                    ? 'bg-blue-600 text-white border-2 border-blue-700'
                    : 'bg-slate-100 text-slate-800 border-2 border-slate-200 hover:border-slate-300'
                }`}
              >
                {result.emoji} {result.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nota rápida */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-semibold text-slate-900 mb-3">🕒 Melhor turno para voltar</h2>
          <div className="flex gap-2">
            {(
              [
                { value: 'manha', label: 'Manhã' },
                { value: 'tarde', label: 'Tarde' },
                { value: 'noite', label: 'Noite' },
              ] as { value: Turno; label: string }[]
            ).map((turno) => (
              <button
                key={turno.value}
                type="button"
                onClick={() => setMelhorTurno(melhorTurno === turno.value ? null : turno.value)}
                className={`flex-1 py-2 rounded text-sm transition ${
                  melhorTurno === turno.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                {turno.label}
              </button>
            ))}
          </div>
        </div>

        {selectedResult === 'compra' && (
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h2 className="font-semibold text-slate-900 mb-3">🛒 Dados da compra</h2>
            <label className="block text-sm text-slate-700 mb-1">Valor (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={valorCompra}
              onChange={(e) => setValorCompra(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={compraAutonoma}
                onChange={(e) => setCompraAutonoma(e.target.checked)}
              />
              Comprou sozinho, sem apoio do vendedor
            </label>
          </div>
        )}

        {(selectedResult === 'cadastrou' || selectedResult === 'em-acompanhamento' || selectedResult === 'fechado' || selectedResult === 'ausente') && (
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h2 className="font-semibold text-slate-900 mb-3">📅 Próximo contato</h2>
            <input
              type="date"
              value={proximoContato}
              onChange={(e) => setProximoContato(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">Quando você combinou de voltar ou de tentar de novo.</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h2 className="font-semibold text-slate-900 mb-3">📝 Nota Rápida</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Proprietário interessado, combinar retorno amanhã..."
            className="w-full p-2 border border-slate-300 rounded text-sm resize-none h-20"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={startVoiceNote}
              disabled={listeningVoice}
              className={`flex-1 py-2 rounded transition text-sm font-medium ${
                listeningVoice
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {listeningVoice ? '🎤 Ouvindo...' : '🎤 Nota por voz'}
            </button>
            <button
              onClick={() => setNote('')}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 rounded transition text-sm"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Botão de envio */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedResult}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            isSubmitting || !selectedResult
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isSubmitting ? '⏳ Enviando...' : '✅ Registrar Visita'}
        </button>
      </div>
    </div>
  );
}
