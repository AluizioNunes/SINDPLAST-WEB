import { ContaReceber } from '@/lib/types/contaReceber';

export function mapContaReceberRow(row: Record<string, unknown>): ContaReceber {
    return {
        id: (row.IdContaReceber as number) || (row.id as number),
        descricao: (row.Descricao as string) || (row.descricao as string),
        valor: (row.Valor as number) || (row.valor as number) || 0,
        vencimento: (row.Vencimento as string) || (row.vencimento as string),
        data_recebimento: (row.DataRecebimento as string) || (row.data_recebimento as string) || null,
        status: (row.Status as string) || (row.status as string) || 'PENDENTE',
        cliente: (row.Cliente as string) || (row.cliente as string) || null,
        centro_custo_id: (row.CentroCustoId as number) || (row.centro_custo_id as number) || null,
        observacao: (row.Observacao as string) || (row.observacao as string) || null,
    };
}
