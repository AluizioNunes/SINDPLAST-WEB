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
        const empresas = (data as Array<Record<string, unknown>>).map((empresa) => ({
            id: empresa.IdEmpresa as number,
            cnpj: empresa.CNPJ as string,
            razaoSocial: empresa.RazaoSocial as string,
            nomeFantasia: empresa.NomeFantasia as string,
            endereco: empresa.Endereco as string,
            numero: empresa.Numero as string,
            complemento: empresa.Complemento as string,
            bairro: empresa.Bairro as string,
            cep: empresa.CEP as string,
            cidade: empresa.Cidade as string,
            uf: empresa.UF as string,
            telefone01: empresa.Telefone01 as string,
            telefone02: empresa.Telefone02 as string,
            fax: empresa.Fax as string,
            celular: empresa.Celular as string,
            whatsapp: empresa.WhatsApp as string,
            instagram: empresa.Instagram as string,
            linkedin: empresa.Linkedin as string,
            nFuncionarios: empresa.NFuncionarios as number,
            dataContribuicao: empresa.DataContribuicao as string,
            valorContribuicao: empresa.ValorContribuicao as number,
            dataCadastro: empresa.DataCadastro as string,
            cadastrante: empresa.Cadastrante as string,
            observacao: empresa.Observacao as string,
        }));

        return NextResponse.json(empresas);
    } catch (error) {
        const err = error as Error;
        console.error('Error fetching empresas:', err);
        return NextResponse.json(
            { error: 'Failed to fetch empresas', message: err.message },
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
    } catch (error) {
        const err = error as Error;
        console.error('Error creating empresa:', err);
        return NextResponse.json(
            { error: 'Failed to create empresa', message: err.message },
            { status: 500 }
        );
    }
}
