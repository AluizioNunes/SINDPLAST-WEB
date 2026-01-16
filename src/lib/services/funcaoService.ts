import { supabase } from '@/lib/supabase';
import { Funcao } from '@/lib/types/funcao';
import { mapFuncaoRow } from '@/lib/mappers/funcao';

interface GetFuncoesOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getFuncoes({ page = 1, limit = 50, search = '' }: GetFuncoesOptions = {}): Promise<{ data: Funcao[], total: number, pages: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('Funcoes')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.ilike('Descricao', `%${search}%`);
    }

    const { data, count, error } = await query
        .order('IdFuncao', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching funcoes:', error);
        throw new Error('Failed to fetch funcoes');
    }

    const funcoes = (data || []).map((row) => mapFuncaoRow(row as Record<string, unknown>));

    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: funcoes, total, pages };
}

export async function getFuncaoById(id: number): Promise<Funcao | null> {
    const { data, error } = await supabase
        .from('Funcoes')
        .select('*')
        .eq('IdFuncao', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return mapFuncaoRow(data as Record<string, unknown>);
}

export async function createFuncao(funcaoData: Partial<Funcao>): Promise<Funcao> {
    const { data, error } = await supabase
        .from('Funcoes')
        .insert([{
            Descricao: funcaoData.descricao,
            CBO: funcaoData.cbo,
            Status: funcaoData.status
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating funcao:', error);
        throw new Error('Failed to create funcao');
    }

    return mapFuncaoRow(data as Record<string, unknown>);
}

export async function updateFuncao(id: number, funcaoData: Partial<Funcao>): Promise<Funcao> {
    const { data, error } = await supabase
        .from('Funcoes')
        .update({
            Descricao: funcaoData.descricao,
            CBO: funcaoData.cbo,
            Status: funcaoData.status
        })
        .eq('IdFuncao', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating funcao:', error);
        throw new Error('Failed to update funcao');
    }

    return mapFuncaoRow(data as Record<string, unknown>);
}

export async function deleteFuncao(id: number): Promise<void> {
    const { error } = await supabase
        .from('Funcoes')
        .delete()
        .eq('IdFuncao', id);

    if (error) {
        console.error('Error deleting funcao:', error);
        throw new Error('Failed to delete funcao');
    }
}
