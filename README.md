# Praso — Plataforma de Campo para Vendedores B2B

Este é um protótipo funcional de uma plataforma de vendedor para field sales B2B, desenvolvida como case de candidatura a RevOps na Praso.

## 📋 Documentação

- **[PLAYBOOK.md](./PLAYBOOK.md)** — "Um dia na vida" do vendedor com a plataforma
- **[DOCUMENTACAO.md](./DOCUMENTACAO.md)** — Funcionalidades e regras do projeto
- **[case_revops_praso.md](./case_revops_praso.md)** — Case original (requirements)
- **[00-pesquisa-referencias.md](./00-pesquisa-referencias.md)** — Pesquisa secundária (cases, GitHub, Reddit)

## 🚀 Quick Start

### Backend (NestJS)

```bash
cd back-end
npm install  # se ainda não instalou
npm run start:dev
```

Backend roda em `http://localhost:3000`

Endpoints principais:
- `GET /establishments` — carteira do dia
- `GET /establishments/:id` — contexto pré-visita
- `POST /visits` — registrar check-in
- `GET /followups/vendor/:vendedorId` — clientes em acompanhamento
- `POST /purchases` — registrar compra

### Frontend (Next.js)

```bash
cd front-end
npm install  # se ainda não instalou
npm run dev
```

Frontend roda em `http://localhost:3001`

Rotas:
- `/` — menu principal
- `/hoje` — carteira do dia (leads/oportunidades)
- `/visita/[id]` — pré-visita + check-in GPS + voz
- `/recorrencias` — acompanhamento de recorrência (3ª compra em 45 dias)
- `/cliente/[id]` — histórico de visitas e compras

## 🎯 Arquitetura

### Backend: NestJS

Cinco módulos independentes:

1. **Establishments** — CRUD + priorização por potencial
   - Seed: 7 estabelecimentos (restaurante, padaria, etc)
   - Filtros: status (lead/oportunidade/cliente/churn), bairro

2. **Visits** — Histórico imutável de visitas
   - Captura: GPS automático, resultado (6 tipos), nota
   - Nunca editado/apagado, apenas "anulado com motivo"

3. **Purchases** — Compras com flag autônoma
   - Seed: 5 compras (mix autônoma vs com apoio)
   - Usado para calcular recorrência

4. **FollowUps** — Acompanhamento pós-1ª compra
   - Cálculo: dias restantes até 45 dias, urgência
   - Dinâmico: clientes com 3+ compras autônomas saem

5. **Sellers** — Pontuação (MEI=0.5, Não-MEI=1, Alto=3)

### Frontend: Next.js + React

Cinco páginas mobile-first:

1. **Home** — Menu com atalhos
2. **Hoje** — Lista priorizada de leads (status, potencial, horário)
3. **Visita** — Cartão de contexto + GPS + resultado + voz
4. **Carteira** — Progress bar visual de recorrência + urgência + actions
5. **Cliente** — Timeline imutável de visitas + compras

**UI/UX:**
- Ícones emoji para referência visual rápida
- Cores: azul (info), verde (ok), laranja (urgência), vermelho (crítico)
- PWA manifest com shortcuts
- Tailwind 4, mobile-first

## ⚙️ Stack

| Camada | Tech |
|--------|------|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind 4 |
| Backend | NestJS 12 + TypeScript |
| DB | In-memory (seed JSON) — trocar por Postgres em produção |
| Deploy | Vercel (frontend) + Render/Railway (backend) |
| Maps | Deep links Google Maps (upgrade: MapLibre + OSRM) |

## 🔑 Decisões de Escopo

Itens **intencionalmente deixados de fora** para economizar tempo:

- ❌ **Autenticação** — vendedor único (seller-1). Produção: multi-tenant
- ❌ **DB persistente** — dados em memória. Produção: Postgres via Prisma
- ❌ **Mapa interativo** — deep links pro Google Maps. Produção: MapLibre
- ❌ **Offline real** — PWA manifest, sem service worker. Produção: Dexie.js + fila
- ❌ **Voz robusta** — Web Speech API nativa. Produção: Deepgram/Google Speech API

Cada um economizaria tempo, mas sem sacrificar a validação de produto.

## 📊 Métricas Validadas

O protótipo foca em **resolver 3 dores reais**:

1. **Registro lento** (5-7 min → 1 min)
   - Geo automático + voz + chips de resultado

2. **Falta de contexto** (CNPJ só → fornecedor + tipo + horário)
   - Cartão pré-visita em 15 segundos

3. **Falta de visibilidade em recorrência** (não sabe quantas compras fez)
   - Dashboard com dias restantes + progress bar + urgência em cores

## 🧪 Teste Local

```bash
# Terminal 1: Backend
cd back-end && npm run start:dev

# Terminal 2: Frontend  
cd front-end && npm run dev

# Abrir em navegador
# http://localhost:3001
```

**Fluxo de teste:**
1. Abrir `/hoje`
2. Clicar em um estabelecimento
3. Ver cartão de contexto
4. Clicar "Registrar Visita" (escolher resultado + nota)
5. Voltar à `/hoje`
6. Abrir `/recorrencias`
7. Ver clientes em acompanhamento (com dias + progresso)

## 📱 PWA

App pode ser instalada no celular (Chrome/Android):

1. Abrir http://localhost:3001 no Chrome mobile
2. Menu → "Instalar app"
3. Ícone "Praso" aparece na tela inicial

Shortcuts:
- "Carteira do Dia" → `/hoje`
- "Recorrências" → `/recorrencias`

## 🚢 Deploy (Próximos Passos)

### Frontend: Vercel

```bash
cd front-end
vercel
# Configura NEXT_PUBLIC_API_URL para backend URL
```

### Backend: Render ou Railway

```bash
# Railway
cd back-end
railway up
# ou Render: git push heroku main
```

## 📝 Commits

Histórico bem estruturado por funcionalidade:

1. `040bda7` — **feat:** NestJS backend + 5 módulos
2. `41f2bf8` — **feat:** Next.js frontend + 5 páginas
3. `416de1c` — **docs:** case, research, playbook, diário

## 🎓 O Que Funciona Bem

1. **Acompanhamento visual de recorrência** — barra + dias + cores = concreto
2. **Contexto pré-visita** — reduz abordagem "fria"
3. **GPS automático** — não precisa digitar
4. **Voz com fallback** — rápido em Chrome, texto em fallback
5. **Priorização inteligente** — leads de alto potencial primeiro

## 🔧 O Que Poderia Melhorar

1. **Teste de campo** — validar com vendedores reais (pendente)
2. **Mapas próprios** — MapLibre + otimização de rota
3. **Offline de verdade** — Dexie.js + service worker
4. **Multi-tenant** — diferentes vendedores por território
5. **Analytics** — tracking de conversão por vendedor

---

**Desenvolvido como case de RevOps — Praso (foodservice B2B)**

Stack escolhida para **máxima velocidade de prototipagem** sem sacrificar validação de produto.
