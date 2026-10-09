# Praso — pesquisa de referências (GitHub, Reddit, cases, stack)

Data: 2026-10-08. Fontes abertas pelos agentes de pesquisa; números de empresas são da própria empresa e não foram auditados. Nenhuma métrica pública equivale à "3ª compra autônoma em 45 dias".

## 1. GitHub — projetos parecidos

Quase não existe app open-source maduro de vendedor externo B2B. Os de field sales de verdade têm 0–7 estrelas; os com volume são sistemas de distribuidor ou apps de coleta em campo de outros setores. Groundwork, FieldOS e Scout: só o README é público.

| Projeto | Stack | Melhores pontos | Fraquezas |
|---|---|---|---|
| [skyasir/van_sales](https://github.com/skyasir/van_sales) (7★) | Frappe + Vue PWA | `client_uid` criado no aparelho (UNIQUE no servidor) → reenvio offline não duplica; falha de rede ≠ recusa do servidor; dinheiro calculado só no servidor; papel do usuário define as telas | sem mapa, visita ou lead |
| [NEWDCMS](https://github.com/NEWDCMS/NEWDCMS) (63★) | .NET + Xamarin | parte de dores reais ("o que prometi na última visita?"); alerta de perda de cliente; cumprimento de visitas planejadas; nível da loja | pesado demais, em chinês |
| [ZONA SFMS](https://github.com/abdullahwaseem-dev/field-sales-management-system) | Flutter + NestJS + Supabase/PostGIS | check-in só vale dentro do raio; GPS suspeito vai a revisão humana; erro anulado com motivo, nunca apagado; regras no banco | sem funil nem ficha |
| [YousefMahfouzz/field-sales-app](https://github.com/YousefMahfouzz/field-sales-app) | React/Vite PWA + Supabase | aviso de duplicata por proximidade; schema enxuto (`visit_frequency_days`, `next_visit_date`, `was_visited`, `wants_next`) | um usuário, sem offline |
| [AutoTrack](https://github.com/Donatas333/Second-Sales-Track) | React + Web Speech + Claude | visita ditada em < 20 s; "sexta que vem" vira data; Atrasados/Hoje/Próximos; alto contraste para sol | localStorage, sem mapa |
| [Groundwork](https://github.com/aahayeswgu/Groundwork-Platform) | Next + Supabase + Gemini | mapa como tela principal; prospecção ao redor da rota; foto de cartão lida por IA | código privado |
| [CGTerritory](https://github.com/consultingarian-eng/cgterritory-os) | JS | faixa "HOJE"; rota pula o trabalhado há 90 dias; "não bater" visível a todos | unidade é a área, não o estabelecimento |
| [FieldOS](https://github.com/kaseypelchy-ops/fieldos-project-showcase) | JS + Supabase | snapshot da oferta; oportunidade parcial ≠ venda; estorno antes de pagar comissão; PWA não atualiza com fila pendente | só vitrine |
| [Scout](https://github.com/ashish221singh/scout-web-app) | Next + Places + IA | app é dono do dado, IA é dona do julgamento; salvar/ignorar/converter | esqueleto |
| [CHT](https://github.com/medic/cht-core) (558★) | Angular + PouchDB | tarefas geradas por evento que somem ao concluir; prioridade; metas em contagem ou % para agente e supervisor | pesado; domínio saúde |
| [StreetComplete](https://github.com/streetcomplete/StreetComplete) (5.043★) | Kotlin | missões de uma pergunta no mapa | só enriquece dado |
| [Every Door](https://github.com/Zverik/every_door) (559★) | Flutter | mostra a idade do dado do pino | README mínimo |

Extra: `atlas-fieldforce/docs/research/field-force-market-scan.md` compara Badger, SPOTIO, Repsly, SalesRabbit e BeatRoute; modelo de indicadores em 3 camadas (Atividade → Execução → Resultado).

**Ranking como base:** 1) field-sales-app, 2) van_sales, 3) ZONA SFMS, 4) CHT, 5) AutoTrack. Menção: StreetComplete (missões de ficha) e FieldOS (snapshot e estorno).

**Padrões recorrentes:** mapa como tela inicial; offline com fila e ID do aparelho; check-in validado por GPS; cadência de revisita e alerta de cliente parado; status negativos explícitos; visita sem atendimento também é registro; histórico imutável; regra e dinheiro no servidor; enriquecimento barato da ficha; metas em 3 camadas; papel define o app.

## 2. Cases de empresas parecidas

- **BEES Force/Grow (Ambev):** +85 tipos de tarefa em 7 clusters; cada uma com elegibilidade, efetividade checada por nota/pedido, score 0–100 e duração; visita tem orçamento de tempo e o algoritmo encaixa tarefas por score; só conta na remuneração se a efetividade for comprovada. Lição da dissertação USP: meta de 30–50% satura o incentivo — quem bate a meta para. Números próprios: +15% lojas visitadas, custo de servir −30%.
- **Coca-Cola FEMSA (Juntos+ Advisor):** rota dinâmica, missões guiadas, visão 360 antes da visita (inclui compra digital); visita de 5–6 min; "eficiência geográfica" (check-in perto do cliente) 92% → 96%; diz ter melhorado a precisão de localização dos clientes.
- **Unilever Shikhar/eB2B:** IA recomenda sortimento p/ visita de 15–20 min; live commerce reativou dormentes (US$ 1 mi, ticket 2,5×, dormência 30% → 24%).
- **Cayena (foodservice BR):** restaurante compra 5–7×/mês; consultor dedicado; crédito. Nada público sobre app de vendedor.
- **Nestlé Vende.Aí:** 35% do tempo do vendedor ia a tarefa administrativa; meta cortar 10 p.p.
- **Sysco AI360:** >95% da força usa por semana. **US Foods/Choco:** foto/PDF/nota manuscrita vira pedido; pedido segue pelo canal do fornecedor (WhatsApp).
- **TradeDepot:** campo adquire, telesales retém. **Frubana:** categoria de entrada de recompra alta.

## 3. Reddit — voz do vendedor e do comprador (25 threads)

Coletado por RSS/PullPush (o Reddit bloqueia busca e API). Lado do comprador é majoritariamente EUA; sem evidência sobre WhatsApp/atacarejo no Brasil.

**10 verdades → decisão de produto**
1. Registro morre com mais de ~3 toques → check-out em 1 toque + voz; resto automático.
2. O vendedor anota no carro, falando → botão de voz ao sair da geocerca.
3. Offline tem de servir para consultar, não só criar (Salesforce falha nisso) → carteira do dia e histórico no aparelho.
4. O pino está errado e quem sabe o ponto certo é o vendedor → "corrigir pino aqui" alimenta a base.
5. O vendedor precisa poder corrigir o dado do cliente.
6. Quem converte 2× lê o contexto antes de entrar → cartão de pré-visita (comprou, recusou, acabou, "pergunte sobre X"). Sem upsell irrelevante.
7. App ganha no recorrente; urgente exige estoque confirmado → repetir pedido em 1 toque.
8. Troca de fornecedor vem de falha (falta, preço sem aviso, pedido retido) → alerta de ruptura e preço antes do cliente.
9. Visita sem aviso irrita; respeitar horário → "melhor horário" por cliente, aviso de chegada, pitch em 60 s.
10. Gamificação só funciona curta, entre pares, sobre ações; ranking permanente vira "dança, macaco" → desafios de 1–2 semanas, oponentes de nível parecido.

Também: registro que serve só ao gerente morre em semanas; ERP dono do dado sem o vendedor poder editar é queixa recorrente.

## 4. Stack e armadilhas técnicas

**Recomendada (1 dia):** Vite + React + TS + vite-plugin-pwa (autoUpdate) + MapLibre (react-map-gl) + OpenFreeMap (sem chave) + Dexie (`useLiveQuery`); dados em JSON já geocodificado; Vercel. Supabase fica para o 2º dia (fila do Dexie envia com upsert por ID do aparelho).

- **Pino errado:** BrasilAPI CEP v2 devolve a coordenada do CEP, não do imóvel (hipótese forte p/ a queixa). Guardar a origem da coordenada (CEP/rua/número/confirmada), desenhar diferente, deixar arrastar, oferecer "atualizar localização" no check-in com `accuracy`. Geocodificar antes e uma vez (geocodebr/IBGE CNEFE, Google ou Nominatim a 1 req/s com cache). Não confiar na nota de confiança do provedor.
- **Rota:** 10–30 visitas → vizinho mais próximo + 2-opt no cliente; botão "navegar" abre Waze/Google. VROOM/ORS depois; OSRM demo é proibido em produção.
- **Offline/iOS:** chamar `navigator.storage.persist()`; ID gerado no aparelho; iOS recusa cache com redirect, `navigator.onLine` mente, `reload()` trava offline, câmera pede permissão a cada abertura (usar `input capture`); Web Speech não funciona offline nem em app instalado no Safari → botão segurar-para-falar, fallback gravar áudio.
- **Outros:** vaul sem manutenção (usar react-modal-sheet); next-pwa não roda com Turbopack; mapa offline só com PMTiles próprio.
- **Enriquecimento BR:** BrasilAPI CNPJ (CNAE, porte, MEI/Simples, telefone, e-mail, endereço) testada ao vivo; base mensal da Receita para prospecção por CNAE/município; IBGE CNAE; Google Places (custo sobe com campos); Overpass/OSM.

## 5. O que o case ainda exige de trabalho próprio

A pesquisa acima é secundária. O PDF pede **campo real** (visitar estabelecimentos, quem decide, horário, fornecedor atual, gatilho de troca) e **diário de bordo** com os estabelecimentos visitados e horas por parte. Nada disso pode ser produzido por pesquisa na web.
