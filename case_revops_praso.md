# Case RevOps Praso

## Contexto

A Praso é um e-commerce B2B do foodservice: conectamos a indústria a mais de 10 mil restaurantes, padarias, lanchonetes e similares, intermediando a venda com estoque e logística próprios. O dono do estabelecimento compra pelo app ou pelo site e recebe da Praso. Operamos no Nordeste, atendendo cidades de Pernambuco, Ceará e Paraíba. Passamos de R$ 300 milhões de receita e crescemos rápido num mercado de R$ 2 trilhões que ainda compra por telefone e caderneta.

Boa parte desse crescimento depende de um time de vendedores de campo. Eles visitam estabelecimentos, convencem o dono a se cadastrar e a fazer a primeira compra, e depois acompanham o cliente até ele comprar sozinho com frequência. Estamos construindo nossa própria plataforma de campo para esse time, em vez de adaptar um CRM de mercado, porque acreditamos que processo e ferramenta desenhados para a nossa venda rendem mais do que telas genéricas. A pessoa de RevOps que vamos contratar vai liderar essa construção, usando IA como ferramenta central de desenvolvimento.

Este case simula o primeiro mês dela no cargo: um problema pouco definido, contexto que precisa ser descoberto na rua, e a expectativa de voltar com uma proposta que um vendedor usaria.

---

## O Desafio

Proponha a plataforma de campo da Praso e o jeito de trabalhar do vendedor dentro dela, de forma que ele ajude na conversão em cada etapa do funil. Para isso, você precisa primeiro entender como é o dia de quem vende e o dia de quem compra.

O case tem três partes:

1. **Campo.** Visite e pesquise estabelecimentos do perfil que atendemos ou poderíamos atender: restaurantes, padarias, lanchonetes, pizzarias, hamburguerias, cafeterias, bares. Descubra quem decide a compra de insumos, quando essa pessoa está disponível, como compra hoje, de quem, e o que a faria trocar de fornecedor ou confiar num app. Pense também como vendedor: se você tivesse que visitar 10 pontos por dia nesse bairro, com intenção de adquirir o máximo deles como clientes, como uma ferramenta de campo te ajudaria no dia a dia?
2. **Plataforma.** A partir do que viu e do que sabe sobre o funil, proponha a plataforma do vendedor: o que ela mostra, o que ela pede, o que ela devolve. Escolha a parte que mais mexe na conversão e construa um protótipo funcional dela, publicado, que funcione no celular (não precisa ser um app mobile, na playstore ou appstore).
3. **Playbook: um dia na vida.** Descreva o dia do vendedor usando a plataforma, da saída de casa ao fim do expediente: o que ele olha, para onde vai, o que faz em cada visita, o que e como registra, e o que recebe de volta por ter registrado. Para cada etapa do funil, o que ele faz de diferente para converter mais.

> *Você não vai conseguir fazer tudo com a profundidade que gostaria. Estamos avaliando o que você escolheu fazer e por quê, tanto quanto o que entregou.*

---

## O Contexto que Entregamos

A venda da Praso é direta e curta: o vendedor visita o estabelecimento, encontra quem decide a compra e o convence a se cadastrar no site ou app ([praso.com.br](https://praso.com.br)) e fazer a primeira compra. O trabalho não termina aí. O mesmo vendedor é responsável por levar o cliente à recorrência, definida como a 3ª compra feita de forma autônoma no app em até 45 dias, normalmente lembrando e acompanhando o cliente.

---

### Detalhamento da Imagem: Fluxo do Funil de Vendas de Campo

![O vendedor leva o estabelecimento da visita até a 3ª compra autônoma](https://via.placeholder.com/800x250.png?text=Fluxo+de+Venda+de+Campo)

#### Descrição Visual e Diagrama da Imagem
A imagem ilustra o **fluxo sequencial de vendas em 6 etapas**, divididas em duas linhas principais de transição:

1. **Visita planejada**
   * *Subtexto:* vendedor vai ao ponto
   * $\rightarrow$ *(Avança para)*
2. **Visita efetiva**
   * *Subtexto:* ponto aberto e encontrado
   * $\rightarrow$ *(Avança para)*
3. **Tomador de decisão**
   * *Subtexto:* presente e disponível
   * $\rightarrow$ *(Avança para)*
4. **Cadastro no app**
   * *Subtexto:* feito na visita
   * $\downarrow$ *(Transição para a linha inferior)*
5. **1ª compra**
   * *Subtexto:* no app, com apoio
   * $\leftarrow$ *(Avança no sentido inverso/retorno para a meta final)*
6. **3ª compra autônoma** *(Destaque com borda azul e fundo diferenciado)*
   * *Subtexto:* em até 45 dias

#### Notas de Contexto do Diagrama:
* **Loop de Acompanhamento:** Entre a *1ª compra* e a *3ª compra autônoma*, existe uma seta indicando a ação contínua: **"vendedor lembra e acompanha"**.
* **Nota Lateral Esquerda:** *"Recorrência é a meta do vendedor, não o cadastro."*
* **Legenda da Imagem:** *"fluxo de venda de campo 6 etapas"*

---

Cada etapa é registrada pelo vendedor na ferramenta atual. Em todas elas vemos vendedores com o dobro da conversão de outros, o que nos diz que há processo e ferramenta a construir. A pergunta do case é o que o vendedor faz de diferente, com a plataforma certa, para passar mais estabelecimentos de uma etapa à seguinte.

---

## Definições que Usamos Internamente

* **Lead:** estabelecimento que nunca se cadastrou na Praso.
* **Oportunidade:** estabelecimento que já se cadastrou mas nunca comprou, ou cliente em churn (mais de 120 dias sem comprar).
* **Pontuação de aquisição:** cada estabelecimento ICP conquistado vale pontos para o vendedor.
  * **MEI:** vale 0,5 ponto;
  * **Não MEI:** vale 1 ponto;
  * **Estabelecimento de alto potencial de compra:** vale 3 pontos.

---

## O que os Vendedores Dizem Hoje

Eles usam um CRM terceiro, adaptado para nosso negócio (Salesforce). Com as palavras deles:

> *"Muitos pinos do meu mapa, estabelecimentos, leads ou oportunidades, não aparecem ou aparecem mal posicionados."*

> *"Acho o processo de registrar qualquer coisa, demorado. Sinto que esses registros mais me tomam tempo do que ajudam no dia a dia."*

> *"Tenho pouca informação do lead ou da oportunidade, normalmente só CNPJ e razão social. Não consigo me planejar tão bem."*

> *"Ficar registrando informação a cada visita hoje não me ajuda no dia a dia. Só toma meu tempo."*

Isso é tudo o que vamos entregar de contexto interno. Lembre-se que hoje estamos insatisfeitos com o Salesforce, justamente por ser limitado, então devem existir oportunidades que nem conhecemos, assim não devem ser dores do time. O resto do contexto você constrói na rua, pesquisa e com as perguntas que fizer. Dúvidas podem ser enviadas por escrito para o gestor da vaga, pelo contato que você receberá junto com este enunciado.

---

## Regras

* **Tempo:** O case deve ser entregue até às 11h59 do sábado.
* **IA:** Use à vontade, contanto que consiga explicar cada decisão.
* **Confidencialidade:** Tudo o que você receber é confidencial. O que você produzir é seu; usamos apenas para avaliar a sua candidatura.

---

## Entregáveis

Envie tudo num único link (pasta, repositório ou doc) até data e hora final.

| Entregável | Formato | O que esperamos |
| :--- | :--- | :--- |
| **Protótipo** | Link publicado + repositório | Funciona no celular e as decisões de produto mais importantes com os trade-offs. |
| **Playbook: um dia na vida** | Doc, 2 a 4 páginas | O dia do vendedor com a plataforma. Em cada etapa do funil, o que ele faz de diferente para converter mais e o que a plataforma faz por ele. |
| **Diário de bordo** | Doc curto | Quais estabelecimentos visitou, quais pesquisas fez, como se organizou para organizar o case, horas gastas por parte e quais partes mais gostou. |

---

## A Sessão de Defesa

Marcamos assim que a entrega e leitura prévia dos entregáveis acontecerem.