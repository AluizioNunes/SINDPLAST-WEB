import type { Dependente } from '@/lib/types/dependente'

function normalizePublicImageUrl(value: unknown): string | undefined {
    const s = value == null ? '' : String(value).trim();
    if (!s) return undefined;
    if (s.includes('/storage/v1/object/public/')) return s;
    if (s.includes('/storage/v1/object/') && !s.includes('/storage/v1/object/public/')) {
        return s.replace('/storage/v1/object/', '/storage/v1/object/public/');
    }
    return s;
}

export function mapDependenteRow(row: Record<string, unknown>): Dependente {
    return {
        id: row.IdDependente as number,
        codDependente: (row.CodDependente as number) ?? 0,
        codSocio: (row.CodSocio as number) ?? 0,
        socio: (row.Socio as string) ?? '',
        empresa: (row.Empresa as string) ?? undefined,
        dependente: (row.Dependente as string) ?? '',
        nascimento: (row.Nascimento as string) ?? '',
        parentesco: (row.Parentesco as string) ?? '',
        carteira: (row.Carteira as boolean) ?? false,
        dataCadastro: (row.DataCadastro as string) ?? '',
        cadastrante: (row.Cadastrante as string) ?? '',
        imagem: normalizePublicImageUrl(row.Imagem),
        status: (row.Status as boolean) ?? undefined,
        flagOrfao: (row.FlagOrfao as boolean) ?? false,
    }
}
