'use client';

import { useEffect, useId, useState } from 'react';
import { Plus, Trash2, Truck } from 'lucide-react';
import { fornecimentosAPI } from '@/lib/api';
import { Fornecimento, FornecimentoRascunho } from '@/lib/types';
import { Badge, Button } from '@/components/ui';

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

const CAMPO =
  'min-h-11 w-full rounded-xl border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground';

interface Props {
  establishmentId: string;
  editavel?: boolean;
  /** Modo da visita: não grava nada na hora; os novos fornecedores vão para `onRascunhoChange`. */
  rascunho?: boolean;
  onRascunhoChange?: (itens: FornecimentoRascunho[]) => void;
}

/** Distribuidoras que fornecem o estabelecimento, por categoria. Permite adicionar e remover. */
export function FornecimentosCard({ establishmentId, editavel = true, rascunho = false, onRascunhoChange }: Props) {
  const idBase = useId();
  const [lista, setLista] = useState<Fornecimento[]>([]);
  const [conhecidas, setConhecidas] = useState<string[]>([]);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('carne');
  const [erro, setErro] = useState<string | null>(null);
  const [pendentes, setPendentes] = useState<FornecimentoRascunho[]>([]);

  useEffect(() => {
    fornecimentosAPI
      .listar(establishmentId)
      .then(setLista)
      .catch(() => setErro('Não foi possível carregar os fornecedores.'));
    fornecimentosAPI
      .distribuidoras()
      .then((d) => setConhecidas(d.map((x) => x.nome)))
      .catch(() => setConhecidas([]));
  }, [establishmentId]);

  function atualizarPendentes(itens: FornecimentoRascunho[]) {
    setPendentes(itens);
    onRascunhoChange?.(itens);
  }

  // Modo visita: só guarda na tela. Nada é gravado até o registro da visita.
  function adicionarRascunho() {
    const distribuidora = nome.trim();
    if (!distribuidora) return;
    const mesmo = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
    const repetido =
      lista.some((f) => mesmo(f.distribuidora.nome, distribuidora) && f.categoria === categoria) ||
      pendentes.some((p) => mesmo(p.distribuidora, distribuidora) && p.categoria === categoria);
    if (repetido) {
      setErro('Esse fornecedor já está cadastrado nesta categoria.');
      return;
    }
    setErro(null);
    atualizarPendentes([...pendentes, { distribuidora, categoria }]);
    setNome('');
  }

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
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar o fornecedor.');
    }
  }

  function retirarRascunho(indice: number) {
    atualizarPendentes(pendentes.filter((_, i) => i !== indice));
  }

  async function remover(f: Fornecimento) {
    try {
      await fornecimentosAPI.remover(f.id);
      setLista((atual) => atual.filter((x) => x.id !== f.id));
    } catch {
      setErro('Erro ao remover o fornecedor.');
    }
  }

  return (
    <section aria-labelledby={`${idBase}-titulo`} className="space-y-3">
      <h2
        id={`${idBase}-titulo`}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground"
      >
        <Truck aria-hidden="true" className="size-4" />
        Fornecedores
      </h2>

      {lista.length === 0 && pendentes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum fornecedor cadastrado.</p>
      ) : (
        <ul className="divide-y divide-border">
          {lista.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2 py-1.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{f.distribuidora.nome}</p>
                <Badge tom="primary" className="mt-0.5">
                  {labelCategoria(f.categoria)}
                </Badge>
              </div>
              {editavel && !rascunho && (
                <Button
                  variante="ghost"
                  aria-label={`Remover ${f.distribuidora.nome} (${labelCategoria(f.categoria)})`}
                  onClick={() => remover(f)}
                  className="size-11 shrink-0 !p-0 text-danger-text hover:bg-danger-soft"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {rascunho && pendentes.length > 0 && (
        <div className="space-y-2 rounded-xl border border-dashed border-primary/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-text">
            Será salvo ao registrar a visita
          </p>
          <ul className="divide-y divide-border">
            {pendentes.map((p, i) => (
              <li key={`${p.distribuidora}-${p.categoria}`} className="flex items-center justify-between gap-2 py-1.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{p.distribuidora}</p>
                  <Badge tom="primary" className="mt-0.5">
                    {labelCategoria(p.categoria)}
                  </Badge>
                </div>
                <Button
                  variante="ghost"
                  aria-label={`Retirar ${p.distribuidora} (${labelCategoria(p.categoria)})`}
                  onClick={() => retirarRascunho(i)}
                  className="size-11 shrink-0 !p-0 text-danger-text hover:bg-danger-soft"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editavel && (
        <div className="space-y-2 rounded-xl bg-muted p-3">
          <div>
            <label htmlFor={`${idBase}-nome`} className="mb-1 block text-sm font-semibold text-foreground">
              Distribuidora
            </label>
            <input
              id={`${idBase}-nome`}
              list={`${idBase}-conhecidas`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da distribuidora"
              className={CAMPO}
            />
            <datalist id={`${idBase}-conhecidas`}>
              {conhecidas.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor={`${idBase}-categoria`} className="mb-1 block text-sm font-semibold text-foreground">
              Categoria
            </label>
            <select
              id={`${idBase}-categoria`}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={CAMPO}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variante="outline"
            cheio
            onClick={rascunho ? adicionarRascunho : adicionar}
            disabled={!nome.trim()}
          >
            <Plus aria-hidden="true" className="size-4" />
            Adicionar fornecedor
          </Button>
        </div>
      )}

      {erro && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger-text">
          {erro}
        </p>
      )}
    </section>
  );
}
