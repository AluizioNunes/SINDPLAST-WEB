import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('Usuarios')
            .select('*')
            .order('IdUsuarios', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching usuarios:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usuarios', message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { data, error } = await supabase
            .from('Usuarios')
            .insert({
                Nome: body.Nome,
                CPF: body.CPF,
                Funcao: body.Funcao,
                Email: body.Email,
                Usuario: body.Usuario,
                Perfil: body.Perfil,
                Cadastrante: body.Cadastrante || 'Sistema',
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating usuario:', error);
        return NextResponse.json(
            { error: 'Failed to create usuario', message: error.message },
            { status: 500 }
        );
    }
}
