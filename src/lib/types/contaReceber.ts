export interface ContaReceber {
    id: number;
    descricao: string;
    valor: number;
    vencimento: string;
    data_recebimento: string | null;
    status: string;
    cliente: string | null;
    centro_custo_id: number | null;
    observacao: string | null;
    centro_custo?: {
        descricao: string;
    };
}
