import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('Empresas')
            .select('*')
            .order('IdEmpresa', { ascending: false });

        if (error) throw error;

        // Transform database format to API format
        const empresas = data.map((empresa: any) => ({
            id: empresa.IdEmpresa,
            cnpj: empresa.CNPJ,
            razaoSocial: empresa.RazaoSocial,
            nomeFantasia: empresa.NomeFantasia,
            endereco: empresa.Endereco,
            numero: empresa.Numero,
            complemento: empresa.Complemento,
            bairro: empresa.Bairro,
            cep: empresa.CEP,
            cidade: empresa.Cidade,
            uf: empresa.UF,
            telefone01: empresa.Telefone01,
            telefone02: empresa.Telefone02,
            fax: empresa.Fax,
            celular: empresa.Celular,
            whatsapp: empresa.WhatsApp,
            instagram: empresa.Instagram,
            linkedin: empresa.Linkedin,
            nFuncionarios: empresa.NFuncionarios,
            dataContribuicao: empresa.DataContribuicao,
            valorContribuicao: empresa.ValorContribuicao,
            dataCadastro: empresa.DataCadastro,
            cadastrante: empresa.Cadastrante,
            observacao: empresa.Observacao,
        }));

        return NextResponse.json(empresas);
    } catch (error: any) {
        console.error('Error fetching empresas:', error);
        return NextResponse.json(
            { error: 'Failed to fetch empresas', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { data, error } = await supabase
            .from('Empresas')
            .insert({
                CNPJ: body.cnpj,
                RazaoSocial: body.razaoSocial,
                NomeFantasia: body.nomeFantasia,
                Endereco: body.endereco,
                Numero: body.numero,
                Complemento: body.complemento,
                Bairro: body.bairro,
                CEP: body.cep,
                Cidade: body.cidade,
                UF: body.uf,
                Telefone01: body.telefone01,
                Telefone02: body.telefone02,
                Fax: body.fax,
                Celular: body.celular,
                WhatsApp: body.whatsapp,
                Instagram: body.instagram,
                Linkedin: body.linkedin,
                NFuncionarios: body.nFuncionarios,
                DataContribuicao: body.dataContribuicao,
                ValorContribuicao: body.valorContribuicao,
                Cadastrante: body.cadastrante || 'Sistema',
                Observacao: body.observacao,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating empresa:', error);
        return NextResponse.json(
            { error: 'Failed to create empresa', message: error.message },
            { status: 500 }
        );
    }
}
