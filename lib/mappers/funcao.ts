import { Funcao } from '@/lib/types/funcao';

export function mapFuncaoRow(row: Record<string, unknown>): Funcao {
    return {
        id: (row.IdFuncao as number) || (row.id as number),
        descricao: (row.Descricao as string) || (row.descricao as string),
        cbo: (row.CBO as string) || (row.cbo as string) || null,
        data_cadastro: (row.DataCadastro as string) || (row.data_cadastro as string) || null,
        status: (row.Status as boolean) ?? (row.status as boolean) ?? true,
    };
}
