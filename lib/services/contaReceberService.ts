import { createClient } from '@/lib/supabase/server';
import { ContaReceber } from '@/lib/types/contaReceber';
import { mapContaReceberRow } from '@/lib/mappers/contaReceber';

interface GetContasReceberOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getContasReceber({ page = 1, limit = 50, search = '' }: GetContasReceberOptions = {}): Promise<{ data: ContaReceber[], total: number, pages: number }> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('ContasReceber')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`Descricao.ilike.%${search}%,Cliente.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('Vencimento', { ascending: true })
        .range(from, to);

    if (error) {
        console.error('Error fetching contas receber:', error);
        throw new Error('Failed to fetch contas receber');
    }

    const contas = (data || []).map((row) => mapContaReceberRow(row as Record<string, unknown>));

    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: contas, total, pages };
}

export async function getContaReceberById(id: number): Promise<ContaReceber | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('ContasReceber')
        .select('*')
        .eq('IdContaReceber', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return mapContaReceberRow(data as Record<string, unknown>);
}

export async function createContaReceber(contaData: Partial<ContaReceber>): Promise<ContaReceber> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('ContasReceber')
        .insert([{
            Descricao: contaData.descricao,
            Valor: contaData.valor,
            Vencimento: contaData.vencimento,
            DataRecebimento: contaData.data_recebimento,
            Status: contaData.status,
            Cliente: contaData.cliente,
            CentroCustoId: contaData.centro_custo_id,
            Observacao: contaData.observacao
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating conta receber:', error);
        throw new Error('Failed to create conta receber');
    }

    return mapContaReceberRow(data as Record<string, unknown>);
}

export async function updateContaReceber(id: number, contaData: Partial<ContaReceber>): Promise<ContaReceber> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ContasReceber')
        .update({
            Descricao: contaData.descricao,
            Valor: contaData.valor,
            Vencimento: contaData.vencimento,
            DataRecebimento: contaData.data_recebimento,
            Status: contaData.status,
            Cliente: contaData.cliente,
            CentroCustoId: contaData.centro_custo_id,
            Observacao: contaData.observacao
        })
        .eq('IdContaReceber', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating conta receber:', error);
        throw new Error('Failed to update conta receber');
    }

    return mapContaReceberRow(data as Record<string, unknown>);
}
