import { CentroCusto } from '@/lib/types/centroCusto';

export function mapCentroCustoRow(row: Record<string, unknown>): CentroCusto {
    return {
        id: (row.IdCentroCusto as number) || (row.id as number),
        codigo: (row.Codigo as string) || (row.codigo as string),
        descricao: (row.Descricao as string) || (row.descricao as string),
        status: (row.Status as boolean) ?? (row.status as boolean) ?? true,
    };
}
