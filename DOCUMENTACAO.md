# Praso Vendedor: documentação de funcionalidades e regras

Protótipo de plataforma de campo para vendedores B2B de foodservice. O vendedor visita estabelecimentos, cadastra, registra compras e acompanha a recorrência de cada cliente. Este documento descreve o que o sistema faz hoje e as regras de negócio implementadas.

---

## 1. Visão geral

| Camada | Tecnologia | Onde roda |
|---|---|---|
| Front-end | Next.js 16, React 19, Tailwind 4 (PWA) | Vercel |
| Back-end | NestJS 12, Prisma 7 | Render |
| Banco | PostgreSQL | Supabase |

**Usuário:** hoje o app tem um único vendedor fixo (`seller-1`), sem login. Autenticação e perfis de gestor ficaram para uma etapa posterior.

---

## 2. Telas

### Início (`/`)
- **Sua pontuação:** total acumulado de pontos do vendedor (ver seção 5).
- **Hoje: X de Y visitas feitas:** progresso do dia, comparando as visitas feitas com a carteira de hoje.
- **Seu funil:** quantidade de leads, oportunidades e clientes.
- **Atalhos:** Carteira do dia e Recorrência.

### Hoje (`/hoje`)
Carteira do dia, ordenada por prioridade. Tem duas abas:
- **Pendentes:** estabelecimentos que ainda não receberam visita hoje. Cada card mostra posição, status, bairro e segmento, melhor horário, barra e motivos da prioridade. Ações: **Iniciar visita**, **Ligar**, **Maps** e **Waze**.
- **Visitados:** estabelecimentos com visita válida hoje. O card mostra só os resultados das visitas de hoje (sem prioridade nem pontuação). Ações: **Ver o que foi feito hoje**, **Ligar**, **Maps** e **Waze**.

As duas abas têm filtros:
- Pendentes: por **bairro** e por **segmento**.
- Visitados: por **bairro** e por **resultado**.

Trocar de aba limpa os filtros. Um contador mostra "Mostrando X de Y".

### Visita (`/visita/[id]`)
Tela de registro. Tem:
- **Contexto:** telefone, endereço, melhor horário, notas de contexto, Maps e Waze.
- **Fornecedores:** distribuidora e categoria. Os novos ficam como rascunho e só são salvos ao registrar a visita.
- **Resultado:** cadastrou, compra, acompanhar, ausente, fechado ou recusou.
- **Compra:** valor (obrigatório e maior que zero) e marcação de compra autônoma.
- **Próximo contato:** data combinada para voltar.
- **Melhor turno:** manhã, tarde ou noite.
- **Nota:** texto digitado ou ditado por voz (Web Speech API, funciona no Chrome).

Ao registrar, a visita, a compra e os fornecedores são gravados numa única operação. Se algo falhar, nada é salvo.

### Resumo do dia (`/hoje/resumo`)
Resumo somente leitura das visitas do dia:
- **Insight:** frase com o total de visitas feitas e de compras (com valor).
- **Cards:** Já visitados, Pendentes e Compras (valor).
- **Gráfico de barras:** quantidade de cada resultado de visita.
- **Lista por estabelecimento:** horário e ação de cada visita, valor de compra, notas, fornecedores cadastrados na visita e data de retorno.
- **Copiar resumo:** texto pronto para WhatsApp ou e-mail.
- **Atualizado às HH:MM:** horário da última atualização.

### Resumo do estabelecimento (`/hoje/visitado/[id]`)
Tela somente leitura, aberta pelo botão "Ver o que foi feito hoje". Mostra o cadastro do lead (status, potencial, segmento, telefone, horário, endereço e notas) e as visitas de hoje, com fornecedores de cada visita e total de compras. Não tem formulário de registro.

### Recorrência (`/recorrencias`)
Clientes em acompanhamento de recorrência:
- Cards com as três etapas de compra autônoma, dias restantes, última compra e próxima pendência.
- Ações: **Visitar** (desabilitado com "Visitado hoje" quando já houve visita no dia) e **Ligar**.
- Clientes já visitados hoje descem para o fim da lista.
- Cliente que bateu a meta sai da lista de visitas.

### Cliente (`/cliente/[id]`)
Histórico do estabelecimento: dados cadastrais, fornecedores, compras e todas as visitas. Permite anular visita (com motivo).

---

## 3. Regras de funil e status

Cada estabelecimento tem um status:

| Status | Significado | Como entra |
|---|---|---|
| **Lead** | Nunca se cadastrou | Estado inicial |
| **Oportunidade** | Cadastrou, ainda não comprou | Visita com resultado "cadastrou" |
| **Cliente** | Já comprou | Visita com resultado "compra" |
| **Churn** | Cliente que parou de comprar | Automático: 120 dias sem compra (ver seção 7) |

Regras:
- Um lead vira oportunidade ou cliente só uma vez (os pontos são dados nessa conquista).
- Compra registrada em oportunidade ou em churn torna o estabelecimento cliente.
- Visita anulada recalcula o status a partir do que restou: com compra vira cliente; com cadastro vira oportunidade; sem nada vira lead. Churn não é recalculado pela anulação.

---

## 4. Prioridade da carteira do dia

A ordem da aba Pendentes é uma pontuação de 0 a 1, com pesos:

| Componente | Peso | Como é calculado |
|---|---|---|
| Urgência da recorrência | 0,20 | Vencida = 1; crítica (até 7 dias) = 0,8; normal = 0,5; fora da recorrência = 0 |
| Potencial | 0,15 | Alto = 1; normal = 0,5; baixo = 0,2 |
| Horário | 0,15 | Dentro de 1h do horário ideal = 1; some em 3h. Sem horário exato, o turno: no turno ideal = 1, fora = 0,2. Sem nada = 0,5 |
| Recência | 0,10 | Nunca visitado = 1; visitado hoje = 0; cresce até 14 dias |
| Distância | 0,15 | Até 0,5 km = 1; 8 km ou mais = 0. Sem GPS = 0,5 |
| Cadastro | 0,15 | Cliente = 1; oportunidade ou churn = 0,5; lead = 0 |
| Retorno combinado | 0,10 | Retorno para hoje ou já vencido = 1; futuro ou sem retorno = 0 |

Os pesos são uma primeira aposta, para ajustar com dados de campo. Clientes que bateram a meta não entram na carteira.

Os **motivos** mostrados em cada card vêm desses componentes (por exemplo, "recorrência crítica: faltam 5 dias" ou "retorno combinado para hoje").

---

## 5. Pontuação do vendedor

A pontuação é um total acumulado. Ela sobe ou desce nas situações abaixo.

| Evento | Pontos |
|---|---|
| Conquista de estabelecimento (cadastro ou primeira compra de lead), alto potencial | 3 |
| Conquista de estabelecimento, MEI | 0,5 |
| Conquista de estabelecimento, Não-MEI (ou sem tipo informado) | 1 |
| 3ª compra autônoma do ciclo (recorrência) | 3 |
| Anulação de visita que gerou pontos | desconta os pontos gerados |

Detalhes:
- Alto potencial vale 3 mesmo se for MEI.
- O ponto de conquista é dado só uma vez por estabelecimento.
- Os pontos gerados por cada visita ficam guardados nela, por isso a anulação desconta exatamente o que foi dado.
- O valor inicial do vendedor de demonstração é 1,5.

---

## 6. Recorrência

Objetivo: fazer o cliente comprar sozinho, sem apoio do vendedor, três vezes.

- **Janela de 15 dias:** cada compra renova o prazo. A próxima compra precisa acontecer até 15 dias depois da última. Se o intervalo passar disso, começa um novo ciclo.
- **Meta:** 3 compras autônomas dentro do mesmo ciclo.
- **Autonomia:** é declarada pelo vendedor, com a marcação "Comprou sozinho, sem apoio do vendedor" no registro da compra. A integração com a plataforma real de pedidos ainda não existe.
- **Pontos:** 3 pontos quando a 3ª compra autônoma do ciclo é registrada.
- **Meta batida:** o cliente sai da carteira de acompanhamento e fica bloqueado para novas visitas e compras.

Urgência do acompanhamento (dias até o fim da janela):
- **Vencida:** prazo já passou.
- **Crítica:** faltam 7 dias ou menos.
- **Normal:** faltam mais de 7 dias.

---

## 7. Churn automático

- Cliente cuja última compra tem mais de **120 dias** vira churn.
- A verificação roda ao listar estabelecimentos e ao montar a carteira do dia.
- Cliente sem nenhuma compra registrada não é marcado (não há base para dizer que parou).
- Compra registrada numa visita reativa o cliente em churn.

---

## 8. Visitas e anulação

- Visitas são registros históricos: não são apagadas nem editadas.
- Uma visita errada é **anulada**, com motivo obrigatório. A anulação:
  - desconta os pontos gerados pela visita;
  - remove a compra ligada a ela;
  - recalcula o status do estabelecimento;
  - mantém a visita no histórico, marcada como anulada.
- Visitas anuladas não contam no resumo do dia, nas abas de Hoje nem na recorrência.
- Um dia é o dia no fuso de **Recife (UTC−3)**. Todas as contagens de "hoje" seguem esse critério.

---

## 9. Fornecedores

- Cada estabelecimento pode ter distribuidoras que o fornecem, por categoria.
- Categorias: carne, pão, bebidas, laticínios, hortifruti, mercearia, embalagens e outros.
- Distribuidora nova é criada na hora, e o nome é comparado sem diferenciar maiúsculas.
- O fornecedor cadastrado durante uma visita fica ligado a ela. Se o fornecimento já existia, não é ligado à nova visita.

---

## 10. Endpoints principais

| Método | Rota | Uso |
|---|---|---|
| GET | `/establishments` | Lista de estabelecimentos (filtros: status, bairro, vendedor) |
| GET | `/establishments/:id` | Dados de um estabelecimento |
| POST | `/establishments` | Cadastro de estabelecimento |
| PATCH | `/establishments/:id/status` | Alteração manual de status |
| GET | `/recommendations/vendor/:id` | Carteira do dia, ordenada por prioridade (aceita `lat` e `lng`) |
| GET | `/visits` | Todas as visitas |
| GET | `/visits/establishment/:id` | Visitas de um estabelecimento |
| POST | `/visits` | Registro de visita (com compra e fornecedores) |
| PATCH | `/visits/:id/anular` | Anulação com motivo |
| GET | `/followups/vendor/:id` | Carteira de recorrência |
| POST | `/purchases` | Registro de compra |
| GET | `/establishments/:id/fornecimentos` | Fornecedores do estabelecimento |
| POST | `/establishments/:id/fornecimentos` | Adicionar fornecedor |
| DELETE | `/fornecimentos/:id` | Remover fornecedor |
| GET | `/sellers/:id` | Dados do vendedor, com pontuação |
| PATCH | `/sellers/:id/score` | Ajuste manual de pontuação |

---

## 11. Modelo de dados (resumo)

- **Vendedor:** nome, pontuação acumulada.
- **Estabelecimento:** razão social, nome fantasia, CNPJ, segmento, tipo de documento (MEI ou Não-MEI), potencial, status, endereço, bairro, coordenadas, telefone, melhor horário e turno, notas de contexto.
- **Visita:** estabelecimento, vendedor, data e hora, resultado, nota, próximo contato, melhor turno, geolocalização, pontos gerados, situação de anulação.
- **Compra:** estabelecimento, data, valor, autonoma (sim ou não), visita de origem.
- **Distribuidora** e **fornecimento** (distribuidora + categoria + estabelecimento + visita de origem).

---

## 12. Limitações conhecidas

- **Sem autenticação.** Qualquer pessoa com acesso à API pode consultar e alterar dados, inclusive pontuação e status. Fica para uma etapa posterior.
- **Vendedor fixo.** O app mostra sempre o `seller-1`.
- **Autonomia declarada.** A compra autônoma depende da marcação do vendedor, não de dados da plataforma.
- **Sem visita planejada.** Todas as visitas são registradas como efetivas. Ainda não há separação entre visita planejada e visita feita.
- **Sem separação de "decisor ausente".** O resultado "ausente" não diferencia ponto aberto sem decisor de ponto fechado.
- **Sem cobertura de território.** Não há regra de quais bairros cada vendedor atende.
- **Dados de exemplo fictícios.** Os estabelecimentos da seed têm CNPJs e horários fictícios e servem só para teste.
- **Voz.** A nota por voz depende do Web Speech API, que funciona no Chrome. Nos outros navegadores, a digitação é o caminho.
- **Offline.** O app é instalável (PWA), mas não tem fila de sincronização: sem internet, o registro não é salvo.

---

## 13. Próximos passos sugeridos

1. Autenticação e perfis (vendedor e gestor).
2. Restringir os endpoints de alteração manual (pontuação e status) ao perfil de gestor, com registro de quem alterou.
3. Separar visita planejada de efetiva e medir a conversão de cada etapa do funil.
4. Definir cobertura por território.
5. Integrar a autonomia com a plataforma de pedidos, para não depender da declaração do vendedor.
6. Ajustar os pesos da prioridade com dados de campo.
7. Fila de sincronização para uso offline.

---

## Glossário

- **Lead:** estabelecimento que nunca se cadastrou.
- **Oportunidade:** cadastrado, ainda não comprou.
- **Cliente:** já comprou.
- **Churn:** cliente sem compra há mais de 120 dias.
- **Compra autônoma:** compra feita sem apoio do vendedor.
- **Ciclo de recorrência:** sequência de compras em que cada uma acontece em até 15 dias da anterior.
- **Carteira do dia:** lista de estabelecimentos para visitar hoje, ordenada por prioridade.
