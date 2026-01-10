import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        const { error } = await supabase
            .from('Usuarios')
            .delete()
            .eq('IdUsuarios', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Usuario excluído com sucesso' });
    } catch (error: any) {
        console.error('Error deleting usuario:', error);
        return NextResponse.json(
            { error: 'Failed to delete usuario', message: error.message },
            { status: 500 }
        );
    }
}
