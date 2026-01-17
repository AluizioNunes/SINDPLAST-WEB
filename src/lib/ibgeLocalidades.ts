import localidades from '@/data/ibge/localidades.json';

type UfEntry = {
    id: number;
    sigla: string;
    nome: string;
    cidades: string[];
};

type LocalidadesJson = {
    version: number;
    source: string;
    generatedAt: string;
    ufs: UfEntry[];
};

const data = localidades as unknown as LocalidadesJson;

export function getUfOptions() {
    return (data.ufs || [])
        .slice()
        .sort((a, b) => a.sigla.localeCompare(b.sigla))
        .map((u) => ({ value: u.sigla, label: u.sigla }));
}

export function getCitiesByUf(ufSigla?: string) {
    const sigla = String(ufSigla || '').toUpperCase();
    if (!sigla) return [];
    const found = (data.ufs || []).find((u) => u.sigla === sigla);
    return (found?.cidades || []).map((c) => ({ value: c, label: c }));
}

