import { supabase } from '@/lib/supabase';
import { Funcionario } from '@/lib/types/funcionario';
import { mapFuncionarioRow } from '@/lib/mappers/funcionario';

interface GetFuncionariosOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getFuncionarios({ page = 1, limit = 50, search = '' }: GetFuncionariosOptions = {}): Promise<{ data: Funcionario[], total: number, pages: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('Funcionarios')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`Nome.ilike.%${search}%,CPF.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('id', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching funcionarios:', error);
        throw new Error('Failed to fetch funcionarios');
    }

    const funcionarios = (data || []).map((row) => mapFuncionarioRow(row as Record<string, unknown>));
    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: funcionarios, total, pages };
}

export async function createFuncionario(data: Partial<Funcionario>): Promise<Funcionario> {
    const dbData = {
        Nome: data.nome,
        Salario: data.salario,
        Cargo: data.cargo || data.cbo,
        EmpresaLocal: data.empresaLocal,
        Depto: data.depto,
        Setor: data.setor,
        CPF: data.cpf,
        DataAdmissao: data.dataAdmissao,
        EmpresaId: data.empresaId
    };

    const { data: result, error } = await supabase
        .from('Funcionarios')
        .insert(dbData)
        .select()
        .single();

    if (error) {
        console.error('Error creating funcionario:', error);
        throw error;
    }
    return mapFuncionarioRow(result as Record<string, unknown>);
}

export async function updateFuncionario(id: number, data: Partial<Funcionario>): Promise<Funcionario> {
    const dbData = {
        Nome: data.nome,
        Salario: data.salario,
        Cargo: data.cargo || data.cbo,
        EmpresaLocal: data.empresaLocal,
        Depto: data.depto,
        Setor: data.setor,
        CPF: data.cpf,
        DataAdmissao: data.dataAdmissao,
        EmpresaId: data.empresaId
    };

    const { data: result, error } = await supabase
        .from('Funcionarios')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapFuncionarioRow(result as Record<string, unknown>);
}

export async function deleteFuncionario(id: number): Promise<void> {
    const { error } = await supabase
        .from('Funcionarios')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting funcionario:', error);
        throw new Error('Failed to delete funcionario');
    }
}
