import fs from 'node:fs';
import path from 'node:path';

const OUT_PATH = path.resolve(process.cwd(), 'src', 'data', 'ibge', 'localidades.json');

async function getJson(url) {
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`IBGE request failed: ${res.status} ${res.statusText} ${url} ${text}`);
  }
  return res.json();
}

function normalizeUf(u) {
  return {
    id: u.id,
    sigla: String(u.sigla || '').toUpperCase(),
    nome: String(u.nome || '').toUpperCase(),
  };
}

function normalizeCity(m) {
  return String(m?.nome || '').toUpperCase();
}

async function main() {
  const ufsRaw = await getJson('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  const ufs = (ufsRaw || []).map(normalizeUf).filter((u) => u.sigla.length === 2);

  const result = { version: 1, source: 'IBGE', generatedAt: new Date().toISOString(), ufs: [] };

  for (const uf of ufs) {
    const citiesRaw = await getJson(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf.id}/municipios?orderBy=nome`);
    const cities = (citiesRaw || []).map(normalizeCity).filter(Boolean);
    result.ufs.push({ ...uf, cidades: cities });
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2) + '\n', 'utf8');
  process.stdout.write(`Wrote ${OUT_PATH} (${result.ufs.length} UFs)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

