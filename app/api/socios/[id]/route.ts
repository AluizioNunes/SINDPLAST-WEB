import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('Socios')
            .select('*')
            .eq('IdSocio', id)
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        const err = error as Error;
        return NextResponse.json(
            { error: 'Failed to fetch socio', message: err.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        const { data, error } = await supabase
            .from('Socios')
            .update({
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
                Cadastrante: body.cadastrante,
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
            .eq('IdSocio', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        const err = error as Error;
        return NextResponse.json(
            { error: 'Failed to update socio', message: err.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { error } = await supabase
            .from('Socios')
            .delete()
            .eq('IdSocio', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Socio deleted successfully' });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json(
            { error: 'Failed to delete socio', message: err.message },
            { status: 500 }
        );
    }
}
