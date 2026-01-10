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
        const socios = data.map((socio: any) => ({
            id: socio.IdSocio,
            nome: socio.Nome,
            rg: socio.RG,
            emissor: socio.Emissor,
            cpf: socio.CPF,
            nascimento: socio.Nascimento,
            sexo: socio.Sexo,
            naturalidade: socio.Naturalidade,
            naturalidadeUF: socio.NaturalidadeUF,
            nacionalidade: socio.Nacionalidade,
            estadoCivil: socio.EstadoCivil,
            endereco: socio.Endereco,
            complemento: socio.Complemento,
            bairro: socio.Bairro,
            cep: socio.CEP,
            celular: socio.Celular,
            redeSocial: socio.RedeSocial,
            pai: socio.Pai,
            mae: socio.Mae,
            dataCadastro: socio.DataCadastro,
            cadastrante: socio.Cadastrante,
            status: socio.Status,
            matricula: socio.Matricula,
            dataMensalidade: socio.DataMensalidade,
            valorMensalidade: socio.ValorMensalidade,
            dataAdmissao: socio.DataAdmissao,
            ctps: socio.CTPS,
            funcao: socio.Funcao,
            codEmpresa: socio.CodEmpresa,
            cnpj: socio.CNPJ,
            razaoSocial: socio.RazaoSocial,
            nomeFantasia: socio.NomeFantasia,
            dataDemissao: socio.DataDemissao,
            motivoDemissao: socio.MotivoDemissao,
            carta: socio.Carta,
            carteira: socio.Carteira,
            ficha: socio.Ficha,
            observacao: socio.Observacao,
            telefone: socio.Telefone,
        }));

        return NextResponse.json(socios);
    } catch (error: any) {
        console.error('Error fetching socios:', error);
        return NextResponse.json(
            { error: 'Failed to fetch socios', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

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
    } catch (error: any) {
        console.error('Error creating socio:', error);
        return NextResponse.json(
            { error: 'Failed to create socio', message: error.message },
            { status: 500 }
        );
    }
}
