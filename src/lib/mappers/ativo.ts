import { Ativo } from '@/lib/types/ativo';

export function mapAtivoRow(row: Record<string, unknown>): Ativo {
    return {
        id: (row.IdAtivo as number) || (row.id as number),
        descricao: (row.Descricao as string) || (row.descricao as string),
        tipo: (row.Tipo as string) || (row.tipo as string) || null,
        valor: (row.Valor as number) || (row.valor as number) || 0,
        data_aquisicao: (row.DataAquisicao as string) || (row.data_aquisicao as string) || null,
        status: (row.Status as string) || (row.status as string) || 'ATIVO',
        observacao: (row.Observacao as string) || (row.observacao as string) || null,
    };
}
