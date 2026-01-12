import { createClient } from '@/lib/supabase/server';
import { mapDependenteRow } from '@/lib/mappers/dependente';
import { Dependente } from '@/lib/types/dependente';

interface GetDependentesOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getDependentes({ page = 1, limit = 50, search = '' }: GetDependentesOptions = {}): Promise<{ data: Dependente[], total: number, pages: number }> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('Dependentes')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`Dependente.ilike.%${search}%,Socio.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('IdDependente', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching dependentes:', error);
        throw new Error('Failed to fetch dependentes');
    }

    const dependentes = (data || []).map((row) => mapDependenteRow(row as Record<string, unknown>));
    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: dependentes, total, pages };
}

export async function createDependente(dependenteData: Partial<Dependente>): Promise<Dependente> {
    const supabase = await createClient();

    const dbData = {
        CodDependente: dependenteData.codDependente,
        CodSocio: dependenteData.codSocio,
        Socio: dependenteData.socio,
        Empresa: dependenteData.empresa,
        Dependente: dependenteData.dependente,
        Nascimento: dependenteData.nascimento,
        Parentesco: dependenteData.parentesco,
        Carteira: dependenteData.carteira,
        DataCadastro: dependenteData.dataCadastro,
        Cadastrante: (await supabase.auth.getUser()).data.user?.email || 'Sistema',
        Imagem: dependenteData.imagem,
        Status: dependenteData.status,
        FlagOrfao: dependenteData.flagOrfao,
    };

    const { data, error } = await supabase
        .from('Dependentes')
        .insert(dbData)
        .select()
        .single();

    if (error) throw error;
    return mapDependenteRow(data as Record<string, unknown>);
}

export async function updateDependente(id: number, dependenteData: Partial<Dependente>): Promise<Dependente> {
    const supabase = await createClient();

    const dbData = {
        CodDependente: dependenteData.codDependente,
        CodSocio: dependenteData.codSocio,
        Socio: dependenteData.socio,
        Empresa: dependenteData.empresa,
        Dependente: dependenteData.dependente,
        Nascimento: dependenteData.nascimento,
        Parentesco: dependenteData.parentesco,
        Carteira: dependenteData.carteira,
        Imagem: dependenteData.imagem,
        Status: dependenteData.status,
        FlagOrfao: dependenteData.flagOrfao,
    };

    const { data, error } = await supabase
        .from('Dependentes')
        .update(dbData)
        .eq('IdDependente', id)
        .select()
        .single();

    if (error) throw error;
    return mapDependenteRow(data as Record<string, unknown>);
}
