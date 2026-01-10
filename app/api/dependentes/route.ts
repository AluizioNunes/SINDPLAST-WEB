
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('Dependentes')
            .select('*')
            .order('IdDependente', { ascending: false });

        if (error) throw error;

        // Transform database format to API format
        const dependentes = data.map((dep: any) => ({
            id: dep.IdDependente,
            codDependente: dep.CodDependente,
            codSocio: dep.CodSocio,
            socio: dep.Socio,
            nome: dep.Dependente,
            nascimento: dep.Nascimento,
            parentesco: dep.Parentesco,
            carteira: dep.Carteira,
            dataCadastro: dep.DataCadastro,
            imagem: dep.Imagem,
            status: dep.Status
        }));

        return NextResponse.json(dependentes);
    } catch (error: any) {
        console.error('Error fetching dependentes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dependentes', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { data, error } = await supabase
            .from('Dependentes')
            .insert({
                CodSocio: body.codSocio,
                Socio: body.socio,
                Dependente: body.nome,
                Nascimento: body.nascimento,
                Parentesco: body.parentesco,
                Carteira: body.carteira,
                Status: body.status ?? true,
                Cadastrante: 'Sistema' // Or get from session
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating dependente:', error);
        return NextResponse.json(
            { error: 'Failed to create dependente', message: error.message },
            { status: 500 }
        );
    }
}
