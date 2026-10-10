# Playbook: Um Dia na Vida do Vendedor Praso

Este playbook descreve como o vendedor usa a plataforma ao longo de um dia de campo. Os nomes das telas e as regras são os do protótipo atual. Os números de impacto são **hipóteses a validar em campo**, não resultados medidos (ver a seção "O que ainda é hipótese").

---

## Contexto Executivo

A plataforma resolve três problemas do vendedor de campo:
1. **Registro lento:** o vendedor levava vários minutos por visita no Salesforce. Aqui, o registro é um toque (resultado) mais uma nota por voz ou digitada.
2. **Falta de contexto:** antes de entrar, ele não sabia fornecedor, melhor horário nem o que foi combinado antes. O cartão da visita mostra isso.
3. **Recorrência sem acompanhamento:** o cliente que comprou uma vez se perdia. A tela de Recorrências mostra o prazo e o que falta para a meta.

A meta do case é a **3ª compra autônoma**. No protótipo, a janela é de **15 dias renovada a cada venda**: cada compra precisa ter a seguinte em até 15 dias. (O case fala em 45 dias; ver a seção de decisões.)

---

## 7h00: Abrir o App

**Tela: Início**
- **Sua pontuação:** o total de pontos do dia a dia.
- **Hoje: X de Y visitas feitas:** o progresso do dia, com a barra.
- **Seu funil:** quantos leads, oportunidades e clientes ele tem.
- **Atalhos:** "Carteira do dia" (aba Hoje) e "Recorrência".

**O que ele faz:** abre o app e toca em **Carteira do dia**.

**Por quê:** a lista já vem em ordem de prioridade. Ele não precisa montar a rota de cabeça.

---

## 8h00: 1ª Visita, Lead de Alto Potencial

### Antes de sair do carro

**Tela: Hoje, aba Pendentes**
- Cada card mostra a posição, o nome, o bairro e o segmento, o status (Lead), o melhor horário e os motivos da prioridade (por exemplo, "alto potencial" e "nunca visitado").
- Botões: **Iniciar visita**, **Ligar**, **Maps** e **Waze**.
- Filtros por bairro e por segmento deixam ele ver só a região onde está.

**Exemplo:** "Bar da Galinha", Candeias, lead de alto potencial, nunca visitado.

**Clica em Maps ou Waze:** a rota abre direto no app de navegação.

### Chegando no local

**Tela: Visita (contexto)**
- Telefone, endereço, melhor horário e notas de contexto (informações já cadastradas ou de visitas anteriores).
- Botões de Maps e Waze, caso ele tenha de encontrar o ponto.

**Ele faz:** entra no estabelecimento.

### Dentro do estabelecimento

Ele conversa com o dono. Se o dono aceita, ele cadastra o estabelecimento na visita (o resultado "Cadastrou"). Se houver fornecedor atual, ele registra a distribuidora e a categoria.

Os fornecedores que ele digita **ficam como rascunho na tela**. Nada é salvo até ele tocar em **Registrar visita**. Se sair sem registrar, nada fica gravado.

### Saindo do carro

**Ainda na tela de Visita:**
- **Resultado:** cadastrou, compra, acompanhar, ausente, fechado ou recusou.
- **Compra:** se houve, informa o valor e marca se foi "comprou sozinho, sem apoio do vendedor".
- **Próximo contato:** a data combinada para voltar.
- **Melhor turno:** manhã, tarde ou noite.
- **Nota:** digitada ou ditada por voz (no Chrome).

Toca em **Registrar visita**. A visita, a compra e os fornecedores são gravados juntos. Se algo falhar, nada é gravado.

### O que muda em relação ao Salesforce

- Não digita endereço: o Maps e o Waze já têm a localização.
- Não procura "qual era o status": o resultado é um toque.
- Não escreve nota longa: pode ditar.
- A visita fica com data e hora automáticas.

---

## 9h30: Depois da visita, a aba Visitados

Quando ele volta à lista, a visita já feita sai de Pendentes e aparece em **Visitados**, com o resultado da visita ("Cadastrou", "Compra" etc.). Cada card de visitado tem:
- **Ver o que foi feito hoje:** abre um resumo somente leitura (cadastro, visitas do dia, fornecedores de cada visita, total de compras). Não tem como registrar nada nessa tela.
- **Ligar, Maps e Waze** continuam disponíveis.

---

## 10h30: Acompanhamento de recorrência

Ele abre **Recorrência**. Para cada cliente, a tela mostra:
- **Compras autônomas:** quantas das 3 ele já tem.
- **Prazo:** quantos dias faltam (ou quantos dias ele já passou).
- **Urgência:** vencida (vermelho), crítica (até 7 dias) ou no prazo.
- **Próxima pendência:** a data limite para a próxima compra.

**Ações:** **Visitar** (fica como "Visitado hoje" depois de uma visita no dia) e **Ligar**.

**Clientes já visitados hoje descem para o fim da lista,** para os que ainda precisam de atenção ficarem em cima.

Quando o cliente faz a 3ª compra autônoma no ciclo, a meta é batida: ele sai do acompanhamento e ganha 3 pontos.

---

## 12h00 e 14h00: Registrar a compra e o retorno

Um cliente de recorrência liga e diz que vai pedir. Ele registra a visita com resultado **Compra**, informa o valor e marca se foi autônoma. Se a compra for a 3ª do ciclo, a meta é batida, e o sistema lança os 3 pontos.

Quando o cliente pede para voltar em outro dia, ele informa a data de **Próximo contato**. A data aparece no card da carteira e influencia a ordem da lista.

---

## 17h00: Fechar o dia

**Tela: Resumo do dia** (botão "Ver resumo do dia" na aba Visitados)

- **Insight:** frase com o total de visitas e de compras ("Você visitou 5 de 12 estabelecimentos e fechou 3 compras, somando R$ 8.200,00").
- **Cards:** Já visitados, Pendentes e Compras (com o valor).
- **Gráfico de barras:** quantas visitas tiveram cada resultado.
- **Lista por estabelecimento:** horário e ação de cada visita, valor de compra, notas, fornecedores cadastrados e data de retorno.
- **Copiar resumo:** texto pronto para colar no WhatsApp ou no e-mail do gestor.

Ele não precisa preencher relatório: o resumo sai das visitas registradas.

---

## Por que o fluxo ajuda (hipóteses)

As três escolhas centrais do produto são estas. O efeito real só se confirma em campo.

### 1. Registro rápido
- Um toque para o resultado, voz ou texto para a nota.
- Localização automática, sem digitar endereço.
- **Hipótese:** mais tempo com o cliente e menos tempo digitando.

### 2. Contexto antes de entrar
- O vendedor sabe o status, o melhor horário, os fornecedores e as notas de visitas anteriores.
- **Hipótese:** menos abordagens frias e mais conversão de visita para cadastro.

### 3. Acompanhamento visível
- Prazo, compras feitas e urgência ficam na mesma tela, com ação direta.
- **Hipótese:** mais clientes chegando à 3ª compra autônoma.

---

## Decisões e limitações do protótipo

- **Sem login:** o app usa um vendedor fixo (`seller-1`, nome de demonstração). Autenticação e perfis de gestor ficam para depois.
- **Banco:** PostgreSQL no Supabase, com migrations. Os dados de exemplo vêm da seed (estabelecimentos de Candeias e Piedade, em Jaboatão dos Guararapes).
- **Mapas:** deep links para Google Maps e Waze. Não há mapa próprio.
- **Offline:** o app é instalável (PWA), mas não tem fila de sincronização. Sem internet, o registro não é salvo.
- **Voz:** Web Speech API, que funciona no Chrome. Nos outros navegadores, a digitação é o caminho.
- **Autonomia da compra:** é declarada pelo vendedor. Ainda não há integração com a plataforma de pedidos.
- **Churn automático:** cliente sem compra há mais de 120 dias vira churn.
- **Pontuação:** cadastro de alto potencial vale 3; MEI, 0,5; Não-MEI, 1; recorrência, 3.

---

## O que ainda é hipótese

- Os percentuais de melhoria de conversão e de recorrência são estimativas, não resultados.
- O tempo economizado por visita (de ~5 para ~1 minuto) precisa ser medido com vendedores reais.
- Os pesos da prioridade da carteira são uma primeira aposta, para ajustar com dados de campo.
- Visitas de campo em Recife ainda não foram feitas. O roteiro e o registro estão em `CAMPO.md`.

---

## Métrica de sucesso

A meta de negócio é a **3ª compra autônoma** do cliente. O protótipo acompanha essa meta em um ciclo em que cada compra precisa ter a seguinte em até 15 dias.

**Fluxo:**
1. Visita → cadastro (contexto antes de entrar).
2. Cadastro → 1ª compra (com o apoio do vendedor).
3. 1ª compra → 3ª compra autônoma (acompanhamento visual e pontos).

**Funcionalidade de apoio em cada etapa:**
- Etapa 1: cartão de contexto e registro rápido.
- Etapa 2: registro da compra com valor e fornecedores.
- Etapa 3: tela de Recorrência, com prazo, urgência e ação direta.
