'use client';

import { useEffect, useState } from 'react';
import { fornecimentosAPI } from '@/lib/api';
import { Fornecimento } from '@/lib/types';

export const CATEGORIAS = [
  { value: 'carne', label: 'Carne' },
  { value: 'pao', label: 'Pão' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'laticinios', label: 'Laticínios' },
  { value: 'hortifruti', label: 'Hortifruti' },
  { value: 'mercearia', label: 'Mercearia' },
  { value: 'embalagens', label: 'Embalagens' },
  { value: 'outros', label: 'Outros' },
];

const labelCategoria = (valor: string) => CATEGORIAS.find((c) => c.value === valor)?.label ?? valor;

interface Props {
  establishmentId: string;
  editavel?: boolean;
}

/** Distribuidoras que fornecem o estabelecimento, por categoria. Permite adicionar e remover. */
export function FornecimentosCard({ establishmentId, editavel = true }: Props) {
  const [lista, setLista] = useState<Fornecimento[]>([]);
  const [conhecidas, setConhecidas] = useState<string[]>([]);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('carne');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fornecimentosAPI
      .listar(establishmentId)
      .then(setLista)
      .catch(() => setErro('Não foi possível carregar os fornecedores'));
    fornecimentosAPI
      .distribuidoras()
      .then((d) => setConhecidas(d.map((x) => x.nome)))
      .catch(() => setConhecidas([]));
  }, [establishmentId]);

  async function adicionar() {
    if (!nome.trim()) return;
    setErro(null);
    try {
      const novo = await fornecimentosAPI.adicionar(establishmentId, nome, categoria);
      setLista((atual) => (atual.some((f) => f.id === novo.id) ? atual : [...atual, novo]));
      if (!conhecidas.includes(novo.distribuidora.nome)) {
        setConhecidas((atual) => [...atual, novo.distribuidora.nome]);
      }
      setNome('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar fornecedor');
    }
  }

  async function remover(f: Fornecimento) {
    try {
      await fornecimentosAPI.remover(f.id);
      setLista((atual) => atual.filter((x) => x.id !== f.id));
    } catch {
      setErro('Erro ao remover fornecedor');
    }
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">🚚 Fornecedores</h3>

      {lista.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum fornecedor cadastrado.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {lista.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2">
              <span>
                <span className="font-medium">{f.distribuidora.nome}</span>{' '}
                <span className="text-slate-500">· {labelCategoria(f.categoria)}</span>
              </span>
              {editavel && (
                <button
                  type="button"
                  onClick={() => remover(f)}
                  className="text-xs text-red-700 hover:underline"
                  aria-label={`Remover ${f.distribuidora.nome}`}
                >
                  remover
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editavel && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              list="distribuidoras-conhecidas"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da distribuidora"
              className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
            />
            <datalist id="distribuidoras-conhecidas">
              {conhecidas.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border border-slate-300 rounded px-2 py-2 text-sm"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={adicionar}
            disabled={!nome.trim()}
            className="bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 text-sm py-2 rounded transition"
          >
            + Adicionar fornecedor
          </button>
        </div>
      )}

      {erro && <p className="mt-2 text-xs text-red-700">{erro}</p>}
    </div>
  );
}
