import { supabase } from '@/lib/supabase';
import { Ativo } from '@/lib/types/ativo';
import { mapAtivoRow } from '@/lib/mappers/ativo';

interface GetAtivosOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getAtivos({ page = 1, limit = 50, search = '' }: GetAtivosOptions = {}): Promise<{ data: Ativo[], total: number, pages: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('Ativos')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`Descricao.ilike.%${search}%,Tipo.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('IdAtivo', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching ativos:', error);
        throw new Error('Failed to fetch ativos');
    }

    const ativos = (data || []).map((row) => mapAtivoRow(row as Record<string, unknown>));

    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: ativos, total, pages };
}

export async function getAtivoById(id: number): Promise<Ativo | null> {
    const { data, error } = await supabase
        .from('Ativos')
        .select('*')
        .eq('IdAtivo', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return mapAtivoRow(data as Record<string, unknown>);
}

export async function createAtivo(ativoData: Partial<Ativo>): Promise<Ativo> {
    const { data, error } = await supabase
        .from('Ativos')
        .insert([{
            Descricao: ativoData.descricao,
            Tipo: ativoData.tipo,
            Valor: ativoData.valor,
            DataAquisicao: ativoData.data_aquisicao,
            Status: ativoData.status,
            Observacao: ativoData.observacao
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating ativo:', error);
        throw new Error('Failed to create ativo');
    }

    return mapAtivoRow(data as Record<string, unknown>);
}

export async function updateAtivo(id: number, ativoData: Partial<Ativo>): Promise<Ativo> {
    const { data, error } = await supabase
        .from('Ativos')
        .update({
            Descricao: ativoData.descricao,
            Tipo: ativoData.tipo,
            Valor: ativoData.valor,
            DataAquisicao: ativoData.data_aquisicao,
            Status: ativoData.status,
            Observacao: ativoData.observacao
        })
        .eq('IdAtivo', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating ativo:', error);
        throw new Error('Failed to update ativo');
    }

    return mapAtivoRow(data as Record<string, unknown>);
}

export async function deleteAtivo(id: number): Promise<void> {
    const { error } = await supabase
        .from('Ativos')
        .delete()
        .eq('IdAtivo', id);

    if (error) {
        console.error('Error deleting ativo:', error);
        throw new Error('Failed to delete ativo');
    }
}
