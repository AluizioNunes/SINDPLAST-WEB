
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
        const dependentes = (data as Array<Record<string, unknown>>).map((dep) => ({
            id: dep.IdDependente as number,
            codDependente: dep.CodDependente as string,
            codSocio: dep.CodSocio as number,
            socio: dep.Socio as string,
            nome: dep.Dependente as string,
            nascimento: dep.Nascimento as string,
            parentesco: dep.Parentesco as string,
            carteira: dep.Carteira as string,
            dataCadastro: dep.DataCadastro as string,
            imagem: dep.Imagem as string,
            status: dep.Status as boolean
        }));

        return NextResponse.json(dependentes);
    } catch (error) {
        const err = error as Error;
        console.error('Error fetching dependentes:', err);
        return NextResponse.json(
            { error: 'Failed to fetch dependentes', message: err.message },
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
    } catch (error) {
        const err = error as Error;
        console.error('Error creating dependente:', err);
        return NextResponse.json(
            { error: 'Failed to create dependente', message: err.message },
            { status: 500 }
        );
    }
}
