import { ContaPagar } from '@/lib/types/contaPagar';

export function mapContaPagarRow(row: Record<string, unknown>): ContaPagar {
    return {
        id: (row.IdContaPagar as number) || (row.id as number),
        descricao: (row.Descricao as string) || (row.descricao as string),
        valor: (row.Valor as number) || (row.valor as number) || 0,
        vencimento: (row.Vencimento as string) || (row.vencimento as string),
        data_pagamento: (row.DataPagamento as string) || (row.data_pagamento as string) || null,
        status: (row.Status as string) || (row.status as string) || 'PENDENTE',
        fornecedor: (row.Fornecedor as string) || (row.fornecedor as string) || null,
        centro_custo_id: (row.CentroCustoId as number) || (row.centro_custo_id as number) || null,
        observacao: (row.Observacao as string) || (row.observacao as string) || null,
    };
}
