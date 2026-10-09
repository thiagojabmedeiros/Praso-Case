// Seed de exemplo: estabelecimentos de Candeias e Piedade (Jaboatão dos Guararapes).
// Endereços e telefones vêm de diretórios públicos (Yelp, Tripadvisor, Rappi, Restaurant Guru,
// registros da Receita via Econodata/cnpj.biz). Onde as fontes divergem, o campo fica com a
// versão mais citada e a divergência vai em notasContexto.
// Melhor horário e fornecedor atual são fictícios (teste); nenhuma fonte pública trouxe esses dados.
// CNPJs marcados como "fictício" são gerados para teste: raiz 99.000.00X, dígitos verificadores
// válidos, sem correspondência com empresas reais. Não usar para contato ou cadastro.

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const sellers = [
  { id: 'seller-1', nome: 'João da Silva', pontuacaoAcumulada: 1.5 },
  { id: 'seller-2', nome: 'Maria dos Santos', pontuacaoAcumulada: 0.5 },
];

const establishments = [
  {
    id: 'est-firetha',
    latitude: -8.199201723330138,
    longitude: -34.91828659814855,
    geocodePrecisao: 'manual',
    fornecedorAtual: 'Distribuidora Teste B',
    melhorHorario: null,
    potencial: 'normal' as const,
    razaoSocial: 'Firetha Burger & Smoked Ltda',
    nomeFantasia: 'Firetha Burger & Smoked',
    cnpj: '52.573.810/0001-30',
    segmento: 'hamburgueria' as const,
    endereco: 'Av. Bernardo Vieira de Melo, 4958, Loja B - Candeias, 54430-770',
    telefone: null,
    bairro: 'Candeias',
    notasContexto:
      'Telefone divergente entre fontes (99756-0773 e 99817-7045). Endereço antigo citado em outras fontes: R. Dr. Aniceto Varejão, 530.',
  },
  {
    id: 'est-betos-bar',
    fornecedorAtual: null,
    melhorHorario: '19:00',
    potencial: 'alto' as const,
    razaoSocial: null,
    nomeFantasia: "Beto's Bar",
    cnpj: '99.000.001/0001-01',
    segmento: 'bar' as const,
    endereco: 'Av. Bernardo Vieira de Melo, 4738 - Candeias, 54440-620',
    telefone: '(81) 3469-3496',
    bairro: 'Candeias',
    notasContexto:
      "CNPJ fictício (teste). Não confundir com Beto's Burguer (nº 4714) e Beto's Hamburgueria (nº 4855).",
  },
  {
    id: 'est-meu-bar',
    latitude: -8.196265315128022,
    longitude: -34.918733871164086,
    geocodePrecisao: 'manual',
    fornecedorAtual: 'Distribuidora Teste C',
    melhorHorario: null,
    potencial: 'normal' as const,
    razaoSocial: null,
    nomeFantasia: 'Meu Bar Candeias',
    cnpj: '37.934.970/0001-74',
    segmento: 'bar' as const,
    endereco: 'Av. Bernardo Vieira de Melo, 4981 - Candeias, 54080-310',
    telefone: '(81) 7905-4669',
    bairro: 'Candeias',
    notasContexto:
      'Horário divergente entre fontes (fecha às 23h45 ou às 0h).',
  },
  {
    id: 'est-du-maranhao',
    latitude: -8.198344350541936,
    longitude: -34.91830598650777,
    geocodePrecisao: 'manual',
    fornecedorAtual: null,
    melhorHorario: '11:30',
    potencial: 'alto' as const,
    razaoSocial: null,
    nomeFantasia: 'Restaurante Du Maranhão',
    cnpj: '99.000.002/0001-48',
    segmento: 'restaurante' as const,
    endereco: 'Av. Bernardo Vieira de Melo, 4993 - Candeias, 54450-020',
    telefone: '+55 81 3469-2559',
    bairro: 'Candeias',
    notasContexto:
      'CNPJ fictício (teste). Cardápio de frutos do mar. Música ao vivo de quarta a domingo. Horário divergente entre fontes.',
  },
  {
    id: 'est-costa-pizzaria',
    fornecedorAtual: 'Distribuidora Teste A',
    melhorHorario: '18:30',
    potencial: 'normal' as const,
    razaoSocial: null,
    nomeFantasia: 'Costa Pizzaria',
    cnpj: '99.000.003/0001-92',
    segmento: 'pizzaria' as const,
    endereco: 'Av. Bernardo Vieira de Melo, 4450 - Candeias, 54430-770',
    telefone: '(81) 99954-9725',
    bairro: 'Candeias',
    notasContexto:
      'CNPJ fictício (teste). Entrega própria. Horário divergente entre fontes (18h às 23h no Instagram).',
  },
  {
    id: 'est-bar-da-galinha',
    latitude: -8.211732566912971,
    longitude: -34.918920899999996,
    geocodePrecisao: 'manual',
    fornecedorAtual: null,
    melhorHorario: null,
    potencial: 'alto' as const,
    razaoSocial: 'S Arruda Bar e Restaurante Sociedade Unipessoal Limitada',
    nomeFantasia: 'Bar da Galinha',
    cnpj: '41.907.166/0001-73',
    segmento: 'bar' as const,
    endereco: 'Av. Bernardo Vieira de Melo, 6355 - Candeias, 54450-020 (frente para o mar)',
    telefone: null,
    bairro: 'Candeias',
    notasContexto:
      'Telefones divergentes entre fontes. Horário divergente (Restaurant Guru: 10h às 20h).',
  },
  {
    id: 'est-atlantico-piedade',
    fornecedorAtual: null,
    melhorHorario: '14:30',
    potencial: 'baixo' as const,
    razaoSocial: null,
    nomeFantasia: 'Pizzaria Atlântico Piedade',
    cnpj: '99.000.004/0001-37',
    segmento: 'pizzaria' as const,
    endereco: 'Av. Ayrton Senna da Silva, 777 - Piedade, 54400-030',
    telefone: '+55 81 2101-1112',
    bairro: 'Piedade',
    notasContexto:
      'CNPJ fictício (teste). Unidade Piedade. Não confundir com Atlântico Express (Av. Ayrton Senna, 750, tel. 2101-1111). Horário das 11h às 23h.',
  },
  {
    id: 'est-zen-piedade',
    latitude: -8.159983733129112,
    longitude: -34.91404328650776,
    geocodePrecisao: 'manual',
    fornecedorAtual: 'Distribuidora Teste C',
    melhorHorario: null,
    potencial: 'baixo' as const,
    razaoSocial: 'R C Catel Ltda',
    nomeFantasia: 'Zen Comida Japonesa',
    cnpj: '16.595.594/0001-60',
    segmento: 'restaurante' as const,
    endereco: 'Rua Osório Borba, 167 - Piedade, 54400-120',
    telefone: '(81) 3094-5028',
    bairro: 'Piedade',
    notasContexto:
      'Telefone divergente (Tripadvisor: 9693-5150). Horário de almoço citado em matéria antiga da Folha PE.',
  },
  {
    id: 'est-recanto-paraibano',
    potencial: 'alto' as const,
    razaoSocial: null,
    nomeFantasia: 'Recanto Paraibano',
    cnpj: '99.000.005/0001-81',
    segmento: 'restaurante' as const,
    endereco: 'Endereço fictício (teste), Casa Forte, Recife - PE',
    telefone: null,
    bairro: 'Casa Forte',
    fornecedorAtual: null,
    melhorHorario: null,
    notasContexto: 'Dados fictícios (teste), exceto nome e bairro. Coordenadas a informar.',
  },
  {
    id: 'est-seu-tito',
    potencial: 'normal' as const,
    razaoSocial: null,
    nomeFantasia: 'Seu Tito',
    cnpj: '99.000.006/0001-26',
    segmento: 'restaurante' as const,
    endereco: 'Endereço fictício (teste), Boa Viagem, Recife - PE',
    telefone: null,
    bairro: 'Boa Viagem',
    fornecedorAtual: 'Distribuidora Teste B',
    melhorHorario: '12:30',
    notasContexto: 'Dados fictícios (teste), exceto nome e bairro. Coordenadas a informar.',
  },
  {
    id: 'est-skillus',
    potencial: 'baixo' as const,
    razaoSocial: null,
    nomeFantasia: 'Skillus',
    cnpj: '99.000.007/0001-70',
    segmento: 'bar' as const,
    endereco: 'Endereço fictício (teste), Ilha do Leite, Recife - PE',
    telefone: null,
    bairro: 'Ilha do Leite',
    fornecedorAtual: null,
    melhorHorario: null,
    notasContexto: 'Dados fictícios (teste), exceto nome e bairro. Coordenadas a informar.',
  },
  {
    id: 'est-varanda-picanha',
    potencial: 'normal' as const,
    razaoSocial: null,
    nomeFantasia: 'Varanda do Picanha',
    cnpj: '99.000.008/0001-15',
    segmento: 'restaurante' as const,
    endereco: 'Endereço fictício (teste), Boa Viagem, Recife - PE',
    telefone: null,
    bairro: 'Boa Viagem',
    fornecedorAtual: null,
    melhorHorario: '19:00',
    notasContexto: 'Dados fictícios (teste), exceto nome e bairro. Coordenadas a informar.',
  },
];

// Compras de exemplo para a carteira de recorrência (valores fictícios, teste).
// Três estados: Beto's vencida (janela de 45 dias já passou), Du Maranhão crítica (faltam 7 dias
// ou menos), Costa normal (acabou de fazer a 1ª compra).
const purchases = [
  { id: 'pur-betos-1', establishmentId: 'est-betos-bar', vendedorId: 'seller-1', data: '2026-08-20', valor: 250, autonoma: false },
  { id: 'pur-betos-2', establishmentId: 'est-betos-bar', vendedorId: 'seller-1', data: '2026-09-02', valor: 260, autonoma: true },
  { id: 'pur-maranhao-1', establishmentId: 'est-du-maranhao', vendedorId: 'seller-1', data: '2026-09-01', valor: 300, autonoma: false },
  { id: 'pur-maranhao-2', establishmentId: 'est-du-maranhao', vendedorId: 'seller-1', data: '2026-09-10', valor: 310, autonoma: true },
  { id: 'pur-maranhao-3', establishmentId: 'est-du-maranhao', vendedorId: 'seller-1', data: '2026-09-20', valor: 320, autonoma: true },
  { id: 'pur-costa-1', establishmentId: 'est-costa-pizzaria', vendedorId: 'seller-1', data: '2026-09-25', valor: 180, autonoma: false },
];

async function main() {
  for (const s of sellers) {
    await prisma.seller.upsert({ where: { id: s.id }, update: s, create: s });
  }
  for (const e of establishments) {
    await prisma.establishment.upsert({
      where: { id: e.id },
      update: e,
      create: { ...e, status: 'lead', score: 0, vendedorId: 'seller-1' },
    });
  }
  for (const p of purchases) {
    const data = { ...p, data: new Date(p.data) };
    await prisma.purchase.upsert({ where: { id: p.id }, update: data, create: data });
  }
  const count = await prisma.establishment.count();
  console.log(`Seed ok: ${sellers.length} vendedores, ${count} estabelecimentos.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
