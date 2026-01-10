import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { error } = await supabase
            .from('Usuarios')
            .delete()
            .eq('IdUsuarios', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Usuario excluído com sucesso' });
    } catch (error) {
        const err = error as Error;
        console.error('Error deleting usuario:', err);
        return NextResponse.json(
            { error: 'Failed to delete usuario', message: err.message },
            { status: 500 }
        );
    }
}
