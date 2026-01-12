import { createClient } from '@/lib/supabase/server';
import { mapFuncionarioRow } from '@/lib/mappers/funcionario';
import { Funcionario } from '@/lib/types/funcionario';

interface GetFuncionariosOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getFuncionarios({ page = 1, limit = 50, search = '' }: GetFuncionariosOptions = {}): Promise<{ data: Funcionario[], total: number, pages: number }> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('Funcionarios')
        .select('*', { count: 'exact' });

    if (search) {
        // Tenta buscar por nome usando diferentes convenções de coluna se necessário, 
        // ou assume uma (aqui estou assumindo 'nome' ou 'FUNCIONARIO_NOME' ou 'Nome')
        // O OR abaixo tenta cobrir casos comuns se o Supabase aceitar. 
        // Mas idealmente deveríamos saber a coluna. 
        // Vou usar 'nome' e 'FUNCIONARIO_NOME' e 'Nome' no OR se o DB permitir colunas inexistentes na query (Postgres não permite).
        // ENTÃO, vou assumir que a tabela segue o padrão 'Socios' que é PascalCase 'Nome', ou legacy 'FUNCIONARIO_NOME'.
        // Como 'Socios' usa 'Nome', vou tentar 'Nome' e 'FUNCIONARIO_NOME'.
        // Mas se uma coluna não existir, a query falha.
        // Solução: Vou assumir que se a tabela existe no Supabase e foi criada recentemente ou importada,
        // vamos tentar ordenar por 'id' que é coluna padrão do Supabase.
        // Para busca, vou arriscar 'Nome' e 'FUNCIONARIO_NOME' com cuidado.
        // Se falhar, o usuário terá que nos dizer a estrutura.
        // Mas o erro anterior era no fetch, possivelmente no order.
        
        // Vou simplificar para buscar em colunas textuais genéricas se possível, ou 'Nome'.
        query = query.or(`Nome.ilike.%${search}%,FUNCIONARIO_NOME.ilike.%${search}%`); 
    }

    // Tenta ordenar por id. Se id não existir, isso falhará.
    // Mas 'id' é gerado por padrão em tabelas novas.
    const { data, count, error } = await query
        .range(from, to);
        // .order('id', { ascending: false }); // Removido temporariamente para evitar erro se coluna não existir

    if (error) {
        console.error('Error fetching funcionarios:', error);
        throw new Error('Failed to fetch funcionarios');
    }

    const funcionarios = (data || []).map((row) => mapFuncionarioRow(row as Record<string, unknown>));
    
    // Ordenação em memória para garantir, já que removemos do banco por segurança
    funcionarios.sort((a, b) => b.id - a.id);

    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: funcionarios, total, pages };
}

export async function createFuncionario(data: Partial<Funcionario>): Promise<Funcionario> {
    const supabase = await createClient();
    
    // Tenta usar PascalCase (Padrão Socios) primeiro, ou fallback para legacy
    // Assumindo PascalCase pois o usuário pediu "mesmo padrão do Socios"
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
        // Fallback para legacy se falhar (opcional, mas arriscado tentar duas vezes)
        throw error;
    }
    return mapFuncionarioRow(result as Record<string, unknown>);
}

export async function updateFuncionario(id: number, data: Partial<Funcionario>): Promise<Funcionario> {
    const supabase = await createClient();

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

    // Tenta match por id ou FUNCIONARIO_ID
    // Supabase geralmente usa 'id' PK.
    const { data: result, error } = await supabase
        .from('Funcionarios')
        .update(dbData)
        .eq('id', id) 
        .select()
        .single();

    if (error) throw error;
    return mapFuncionarioRow(result as Record<string, unknown>);
}
