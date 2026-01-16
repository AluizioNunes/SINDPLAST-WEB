import type { Dependente } from '@/lib/types/dependente'

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
        imagem: (row.Imagem as string) ?? undefined,
        status: (row.Status as boolean) ?? undefined,
        flagOrfao: (row.FlagOrfao as boolean) ?? false,
    }
}
