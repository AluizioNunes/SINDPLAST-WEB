import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('Socios')
            .select('*')
            .order('IdSocio', { ascending: false });

        if (error) throw error;

        // Transform database format to API format
        const socios = (data as Array<Record<string, unknown>>).map((socio) => ({
            id: socio.IdSocio as number,
            nome: socio.Nome as string,
            rg: socio.RG as string,
            emissor: socio.Emissor as string,
            cpf: socio.CPF as string,
            nascimento: socio.Nascimento as string,
            sexo: socio.Sexo as string,
            naturalidade: socio.Naturalidade as string,
            naturalidadeUF: socio.NaturalidadeUF as string,
            nacionalidade: socio.Nacionalidade as string,
            estadoCivil: socio.EstadoCivil as string,
            endereco: socio.Endereco as string,
            complemento: socio.Complemento as string,
            bairro: socio.Bairro as string,
            cep: socio.CEP as string,
            celular: socio.Celular as string,
            redeSocial: socio.RedeSocial as string,
            pai: socio.Pai as string,
            mae: socio.Mae as string,
            dataCadastro: socio.DataCadastro as string,
            cadastrante: socio.Cadastrante as string,
            status: socio.Status as string,
            matricula: socio.Matricula as string,
            dataMensalidade: socio.DataMensalidade as string,
            valorMensalidade: socio.ValorMensalidade as number,
            dataAdmissao: socio.DataAdmissao as string,
            ctps: socio.CTPS as string,
            funcao: socio.Funcao as string,
            codEmpresa: socio.CodEmpresa as number,
            cnpj: socio.CNPJ as string,
            razaoSocial: socio.RazaoSocial as string,
            nomeFantasia: socio.NomeFantasia as string,
            dataDemissao: socio.DataDemissao as string,
            motivoDemissao: socio.MotivoDemissao as string,
            carta: socio.Carta as string,
            carteira: socio.Carteira as string,
            ficha: socio.Ficha as string,
            observacao: socio.Observacao as string,
            telefone: socio.Telefone as string,
        }));

        return NextResponse.json(socios);
    } catch (error) {
        const err = error as Error;
        console.error('Error fetching socios:', err);
        return NextResponse.json(
            { error: 'Failed to fetch socios', message: err.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = (await request.json()) as Record<string, unknown>;

        const { data, error } = await supabase
            .from('Socios')
            .insert({
                Nome: body.nome,
                RG: body.rg,
                Emissor: body.emissor,
                CPF: body.cpf,
                Nascimento: body.nascimento,
                Sexo: body.sexo,
                Naturalidade: body.naturalidade,
                NaturalidadeUF: body.naturalidadeUF,
                Nacionalidade: body.nacionalidade,
                EstadoCivil: body.estadoCivil,
                Endereco: body.endereco,
                Complemento: body.complemento,
                Bairro: body.bairro,
                CEP: body.cep,
                Celular: body.celular,
                RedeSocial: body.redeSocial,
                Pai: body.pai,
                Mae: body.mae,
                Cadastrante: body.cadastrante || 'Sistema',
                Status: body.status,
                Matricula: body.matricula,
                DataMensalidade: body.dataMensalidade,
                ValorMensalidade: body.valorMensalidade,
                DataAdmissao: body.dataAdmissao,
                CTPS: body.ctps,
                Funcao: body.funcao,
                CodEmpresa: body.codEmpresa,
                CNPJ: body.cnpj,
                RazaoSocial: body.razaoSocial,
                NomeFantasia: body.nomeFantasia,
                DataDemissao: body.dataDemissao,
                MotivoDemissao: body.motivoDemissao,
                Carta: body.carta,
                Carteira: body.carteira,
                Ficha: body.ficha,
                Observacao: body.observacao,
                Telefone: body.telefone,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        const err = error as Error;
        console.error('Error creating socio:', err);
        return NextResponse.json(
            { error: 'Failed to create socio', message: err.message },
            { status: 500 }
        );
    }
}
