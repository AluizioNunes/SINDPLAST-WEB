import { createClient } from '@/lib/supabase/server';
import { mapEmpresaRow } from '@/lib/mappers/empresa';
import { Empresa } from '@/lib/types/empresa';

interface GetEmpresasOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getEmpresas({ page = 1, limit = 50, search = '' }: GetEmpresasOptions = {}): Promise<{ data: Empresa[], total: number, pages: number }> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('Empresas')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`RazaoSocial.ilike.%${search}%,NomeFantasia.ilike.%${search}%,CNPJ.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('IdEmpresa', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching empresas:', error);
        throw new Error('Failed to fetch empresas');
    }

    const empresas = (data || []).map((row) => mapEmpresaRow(row as Record<string, unknown>));
    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: empresas, total, pages };
}

export async function createEmpresa(empresaData: Partial<Empresa>): Promise<Empresa> {
    const supabase = await createClient();

    const dbData = {
        CodEmpresa: empresaData.codEmpresa,
        CNPJ: empresaData.cnpj,
        RazaoSocial: empresaData.razaoSocial,
        NomeFantasia: empresaData.nomeFantasia,
        Endereco: empresaData.endereco,
        Numero: empresaData.numero,
        Complemento: empresaData.complemento,
        Bairro: empresaData.bairro,
        CEP: empresaData.cep,
        Cidade: empresaData.cidade,
        UF: empresaData.uf,
        Telefone01: empresaData.telefone01,
        Telefone02: empresaData.telefone02,
        Fax: empresaData.fax,
        Celular: empresaData.celular,
        WhatsApp: empresaData.whatsapp,
        Instagram: empresaData.instagram,
        Linkedin: empresaData.linkedin,
        NFuncionarios: empresaData.nFuncionarios,
        DataContribuicao: empresaData.dataContribuicao,
        ValorContribuicao: empresaData.valorContribuicao,
        Cadastrante: (await supabase.auth.getUser()).data.user?.email || 'Sistema',
        Observacao: empresaData.observacao,
    };

    const { data, error } = await supabase
        .from('Empresas')
        .insert(dbData)
        .select()
        .single();

    if (error) throw error;
    return mapEmpresaRow(data as Record<string, unknown>);
}

export async function updateEmpresa(id: number, empresaData: Partial<Empresa>): Promise<Empresa> {
    const supabase = await createClient();

    const dbData = {
        CodEmpresa: empresaData.codEmpresa,
        CNPJ: empresaData.cnpj,
        RazaoSocial: empresaData.razaoSocial,
        NomeFantasia: empresaData.nomeFantasia,
        Endereco: empresaData.endereco,
        Numero: empresaData.numero,
        Complemento: empresaData.complemento,
        Bairro: empresaData.bairro,
        CEP: empresaData.cep,
        Cidade: empresaData.cidade,
        UF: empresaData.uf,
        Telefone01: empresaData.telefone01,
        Telefone02: empresaData.telefone02,
        Fax: empresaData.fax,
        Celular: empresaData.celular,
        WhatsApp: empresaData.whatsapp,
        Instagram: empresaData.instagram,
        Linkedin: empresaData.linkedin,
        NFuncionarios: empresaData.nFuncionarios,
        DataContribuicao: empresaData.dataContribuicao,
        ValorContribuicao: empresaData.valorContribuicao,
        Observacao: empresaData.observacao,
    };

    const { data, error } = await supabase
        .from('Empresas')
        .update(dbData)
        .eq('IdEmpresa', id)
        .select()
        .single();

    if (error) throw error;
    return mapEmpresaRow(data as Record<string, unknown>);
}
