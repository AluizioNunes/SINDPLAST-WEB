export interface Ativo {
    id: number;
    descricao: string;
    tipo: string | null;
    valor: number | null;
    data_aquisicao: string | null;
    status: string;
    observacao: string | null;
}
