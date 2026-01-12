import { createClient } from '@/lib/supabase/server';
import { ContaPagar } from '@/lib/types/contaPagar';
import { mapContaPagarRow } from '@/lib/mappers/contaPagar';

interface GetContasPagarOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getContasPagar({ page = 1, limit = 50, search = '' }: GetContasPagarOptions = {}): Promise<{ data: ContaPagar[], total: number, pages: number }> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('ContasPagar')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`Descricao.ilike.%${search}%,Fornecedor.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('Vencimento', { ascending: true })
        .range(from, to);

    if (error) {
        console.error('Error fetching contas pagar:', error);
        throw new Error('Failed to fetch contas pagar');
    }

    const contas = (data || []).map((row) => mapContaPagarRow(row as Record<string, unknown>));

    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: contas, total, pages };
}

export async function getContaPagarById(id: number): Promise<ContaPagar | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('ContasPagar')
        .select('*')
        .eq('IdContaPagar', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return mapContaPagarRow(data as Record<string, unknown>);
}

export async function createContaPagar(contaData: Partial<ContaPagar>): Promise<ContaPagar> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('ContasPagar')
        .insert([{
            Descricao: contaData.descricao,
            Valor: contaData.valor,
            Vencimento: contaData.vencimento,
            DataPagamento: contaData.data_pagamento,
            Status: contaData.status,
            Fornecedor: contaData.fornecedor,
            CentroCustoId: contaData.centro_custo_id,
            Observacao: contaData.observacao
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating conta pagar:', error);
        throw new Error('Failed to create conta pagar');
    }

    return mapContaPagarRow(data as Record<string, unknown>);
}

export async function updateContaPagar(id: number, contaData: Partial<ContaPagar>): Promise<ContaPagar> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ContasPagar')
        .update({
            Descricao: contaData.descricao,
            Valor: contaData.valor,
            Vencimento: contaData.vencimento,
            DataPagamento: contaData.data_pagamento,
            Status: contaData.status,
            Fornecedor: contaData.fornecedor,
            CentroCustoId: contaData.centro_custo_id,
            Observacao: contaData.observacao
        })
        .eq('IdContaPagar', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating conta pagar:', error);
        throw new Error('Failed to update conta pagar');
    }

    return mapContaPagarRow(data as Record<string, unknown>);
}
