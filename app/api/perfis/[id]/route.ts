import { NextResponse } from 'next/server';
import { deletePerfil } from '@/lib/services/perfilService';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await deletePerfil(parseInt(id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/perfis/[id]:', error);
        return NextResponse.json(
            { error: 'Failed to delete perfil' },
            { status: 500 }
        );
    }
}
