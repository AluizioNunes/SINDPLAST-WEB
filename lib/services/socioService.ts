import { createClient } from '@/lib/supabase/server';
import { mapSocioRow } from '@/lib/mappers/socio';
import { Socio } from '@/lib/types/socio';

interface GetSociosOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getSocios({ page = 1, limit = 50, search = '' }: GetSociosOptions = {}): Promise<{ data: Socio[], total: number, pages: number }> {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('Socios')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.or(`Nome.ilike.%${search}%,CPF.ilike.%${search}%,Matricula.ilike.%${search}%`);
    }

    const { data, count, error } = await query
        .order('IdSocio', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching socios:', error);
        throw new Error('Failed to fetch socios');
    }

    const socios = (data || []).map((row) => mapSocioRow(row as Record<string, unknown>));
    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return { data: socios, total, pages };
}

export async function getSocioById(id: number): Promise<Socio | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('Socios')
        .select('*')
        .eq('IdSocio', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return mapSocioRow(data as Record<string, unknown>);
}

export async function createSocio(socioData: Partial<Socio>): Promise<Socio> {
    const supabase = await createClient();
    
    // Mapeamento inverso poderia ser necessário aqui se os campos do banco diferem muito dos tipos
    // Assumindo que o Supabase aceita as chaves como estão ou precisamos de um mapper reverso.
    // O código original fazia um insert manual campo a campo. Vamos simplificar, mas manter a segurança.
    
    const dbData = {
        Nome: socioData.nome,
        CPF: socioData.cpf,
        RG: socioData.rg,
        // ... mapear todos os campos necessários
        Status: socioData.status,
        Cadastrante: (await supabase.auth.getUser()).data.user?.email || 'Sistema',
        // Adicionar outros campos conforme necessário, baseando-se no original POST
        Emissor: socioData.emissor,
        Nascimento: socioData.nascimento,
        Sexo: socioData.sexo,
        Naturalidade: socioData.naturalidade,
        NaturalidadeUF: socioData.naturalidadeUF,
        Nacionalidade: socioData.nacionalidade,
        EstadoCivil: socioData.estadoCivil,
        Endereco: socioData.endereco,
        Complemento: socioData.complemento,
        Bairro: socioData.bairro,
        CEP: socioData.cep,
        Celular: socioData.celular,
        RedeSocial: socioData.redeSocial,
        Pai: socioData.pai,
        Mae: socioData.mae,
        Matricula: socioData.matricula,
        DataMensalidade: socioData.dataMensalidade,
        ValorMensalidade: socioData.valorMensalidade,
        DataAdmissao: socioData.dataAdmissao,
        CTPS: socioData.ctps,
        Funcao: socioData.funcao,
        CodEmpresa: socioData.codEmpresa,
        CNPJ: socioData.cnpj,
        RazaoSocial: socioData.razaoSocial,
        NomeFantasia: socioData.nomeFantasia,
        DataDemissao: socioData.dataDemissao,
        MotivoDemissao: socioData.motivoDemissao,
        Carta: socioData.carta,
        Carteira: socioData.carteira,
        Ficha: socioData.ficha,
        Observacao: socioData.observacao,
        Telefone: socioData.telefone
    };

    const { data, error } = await supabase
        .from('Socios')
        .insert(dbData)
        .select()
        .single();

    if (error) throw error;
    return mapSocioRow(data as Record<string, unknown>);
}

export async function updateSocio(id: number, socioData: Partial<Socio>): Promise<Socio> {
    const supabase = await createClient();

    const dbData = {
        Nome: socioData.nome,
        CPF: socioData.cpf,
        RG: socioData.rg,
        Status: socioData.status,
        Emissor: socioData.emissor,
        Nascimento: socioData.nascimento,
        Sexo: socioData.sexo,
        Naturalidade: socioData.naturalidade,
        NaturalidadeUF: socioData.naturalidadeUF,
        Nacionalidade: socioData.nacionalidade,
        EstadoCivil: socioData.estadoCivil,
        Endereco: socioData.endereco,
        Complemento: socioData.complemento,
        Bairro: socioData.bairro,
        CEP: socioData.cep,
        Celular: socioData.celular,
        RedeSocial: socioData.redeSocial,
        Pai: socioData.pai,
        Mae: socioData.mae,
        Matricula: socioData.matricula,
        DataMensalidade: socioData.dataMensalidade,
        ValorMensalidade: socioData.valorMensalidade,
        DataAdmissao: socioData.dataAdmissao,
        CTPS: socioData.ctps,
        Funcao: socioData.funcao,
        CodEmpresa: socioData.codEmpresa,
        CNPJ: socioData.cnpj,
        RazaoSocial: socioData.razaoSocial,
        NomeFantasia: socioData.nomeFantasia,
        DataDemissao: socioData.dataDemissao,
        MotivoDemissao: socioData.motivoDemissao,
        Carta: socioData.carta,
        Carteira: socioData.carteira,
        Ficha: socioData.ficha,
        Observacao: socioData.observacao,
        Telefone: socioData.telefone
    };

    const { data, error } = await supabase
        .from('Socios')
        .update(dbData)
        .eq('IdSocio', id)
        .select()
        .single();

    if (error) throw error;
    return mapSocioRow(data as Record<string, unknown>);
}
