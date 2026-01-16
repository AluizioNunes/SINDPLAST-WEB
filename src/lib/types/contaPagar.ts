export interface ContaPagar {
    id: number;
    descricao: string;
    valor: number;
    vencimento: string;
    data_pagamento: string | null;
    status: string;
    fornecedor: string | null;
    centro_custo_id: number | null;
    observacao: string | null;
    // Joined fields if needed, e.g. centro_custo_descricao
    centro_custo?: {
        descricao: string;
    };
}
