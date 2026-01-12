import { createClient } from '@/lib/supabase/server';
import { CentroCusto } from '@/lib/types/centroCusto';
import { mapCentroCustoRow } from '@/lib/mappers/centroCusto';

interface GetCentroCustosOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getCentroCustos({ page = 1, limit = 50, search = '' }: GetCentroCustosOptions = {}): Promise<{ data: CentroCusto[], total: number, pages: number }> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('CentroCustos')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`Codigo.ilike.%${search}%,Descricao.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('IdCentroCusto', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching centro custos:', error);
        throw new Error('Failed to fetch centro custos');
    }

    const centros = (data || []).map((row) => mapCentroCustoRow(row as Record<string, unknown>));

    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: centros, total, pages };
}

export async function getCentroCustoById(id: number): Promise<CentroCusto | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('CentroCustos')
        .select('*')
        .eq('IdCentroCusto', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return mapCentroCustoRow(data as Record<string, unknown>);
}

export async function createCentroCusto(centroCustoData: Partial<CentroCusto>): Promise<CentroCusto> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('CentroCustos')
        .insert([{
            Codigo: centroCustoData.codigo,
            Descricao: centroCustoData.descricao,
            Status: centroCustoData.status
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating centro custo:', error);
        throw new Error('Failed to create centro custo');
    }

    return mapCentroCustoRow(data as Record<string, unknown>);
}

export async function updateCentroCusto(id: number, centroCustoData: Partial<CentroCusto>): Promise<CentroCusto> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('CentroCustos')
        .update({
            Codigo: centroCustoData.codigo,
            Descricao: centroCustoData.descricao,
            Status: centroCustoData.status
        })
        .eq('IdCentroCusto', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating centro custo:', error);
        throw new Error('Failed to update centro custo');
    }

    return mapCentroCustoRow(data as Record<string, unknown>);
}
