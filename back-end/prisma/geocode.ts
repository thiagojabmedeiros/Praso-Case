// Geocodifica os endereços dos estabelecimentos usando o Photon (OpenStreetMap).
// Grava latitude/longitude e a precisão: "poi" (ponto de interesse com o mesmo nome) ou "numero"
// (casa exata). Estabelecimentos sem nenhum dos dois ficam sem coordenada.
// Uso: npx ts-node --transpile-only prisma/geocode.ts [--force]
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const FORCE = process.argv.includes('--force');
const PAUSA_MS = 1100; // Photon pede no máximo uma requisição por segundo

interface Feature {
  properties: {
    housenumber?: string;
    name?: string;
    city?: string;
    state?: string;
    countrycode?: string;
  };
  geometry: { coordinates: [number, number] }; // [lng, lat]
}

// "Av. Bernardo Vieira de Melo, 4738 - Candeias, 54440-620" → via e número
function extrairViaENumero(endereco: string): { via: string; numero: string | null } {
  const match = endereco.match(/^(.*?),\s*(\d+[A-Za-z]?)\b/);
  if (!match) return { via: endereco.split(',')[0].trim(), numero: null };
  return { via: match[1].trim(), numero: match[2] };
}

async function buscar(consulta: string): Promise<Feature[]> {
  const url = `https://photon.komoot.io/api/?limit=10&q=${encodeURIComponent(consulta)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Photon respondeu ${res.status}`);
  const json = (await res.json()) as { features: Feature[] };
  return json.features.filter(
    (f) =>
      f.properties.countrycode === 'BR' &&
      f.properties.state === 'Pernambuco' &&
      (f.properties.city ?? '').includes('Jaboatão'),
  );
}

// Normaliza para comparar nomes: minúsculas, sem acento e sem pontuação.
function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Só usamos o ponto da via se for a casa exata ou um ponto de interesse com o mesmo nome.
// Coordenada só da via (sem número) cai no mesmo trecho de avenida e não diferencia os
// estabelecimentos, então fica de fora.
async function geocodificar(nome: string, endereco: string, bairro: string) {
  const { via, numero } = extrairViaENumero(endereco);
  const local = `${bairro}, Jaboatão dos Guararapes, Pernambuco`;

  // Palavras genéricas do tipo de estabelecimento não identificam o lugar.
  const GENERICAS = new Set(['restaurante', 'bar', 'pizzaria', 'pizzeria', 'comida', 'japonesa', 'burger', 'smoked', 'ltda', 'de', 'da', 'do', 'e']);
  const bairroNorm = normalizar(bairro);
  const distintivas = normalizar(nome).split(' ').filter((p) => p.length > 1 && !GENERICAS.has(p) && !bairroNorm.split(' ').includes(p));

  const porNome = await buscar(`${nome}, ${local}`);
  const poi = porNome.find(
    (f) =>
      f.properties.name &&
      distintivas.every((p) => normalizar(f.properties.name!).split(' ').includes(p)) &&
      (!f.properties.district || normalizar(f.properties.district).includes(bairroNorm)),
  );
  if (poi) return { lat: poi.geometry.coordinates[1], lng: poi.geometry.coordinates[0], precisao: 'poi' as const };

  if (numero) {
    const comNumero = await buscar(`${via} ${numero}, ${local}`);
    const exata = comNumero.find((f) => f.properties.housenumber === numero);
    if (exata) return { lat: exata.geometry.coordinates[1], lng: exata.geometry.coordinates[0], precisao: 'numero' as const };
  }

  return null;
}

async function main() {
  const estabelecimentos = await prisma.establishment.findMany({
    where: FORCE ? {} : { latitude: null },
    orderBy: { nomeFantasia: 'asc' },
  });

  for (const est of estabelecimentos) {
    try {
      const resultado = await geocodificar(est.nomeFantasia, est.endereco, est.bairro);
      if (resultado) {
        await prisma.establishment.update({
          where: { id: est.id },
          data: { latitude: resultado.lat, longitude: resultado.lng, geocodePrecisao: resultado.precisao },
        });
        console.log(`${est.nomeFantasia.padEnd(30)} ${resultado.precisao.padEnd(7)} ${resultado.lat.toFixed(5)}, ${resultado.lng.toFixed(5)}`);
      } else {
        // Limpa coordenadas antigas (ex.: ponto genérico de uma execução anterior)
        await prisma.establishment.update({
          where: { id: est.id },
          data: { latitude: null, longitude: null, geocodePrecisao: null },
        });
        console.log(`${est.nomeFantasia.padEnd(30)} NÃO ENCONTRADO (sem ponto de interesse nem número exato)`);
      }
    } catch (err) {
      console.log(`${est.nomeFantasia.padEnd(30)} ERRO: ${(err as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, PAUSA_MS));
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
