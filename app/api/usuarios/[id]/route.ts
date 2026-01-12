import { requireAuth } from '@/lib/api/auth'
import { internalError, noContent } from '@/lib/api/http'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth()
        if ('response' in auth) return auth.response

        const { id } = await params

        const { error } = await auth.supabase
            .from('Usuarios')
            .delete()
            .eq('IdUsuarios', id);

        if (error) throw error

        return noContent()
    } catch (error) {
        const err = error as Error
        console.error('Error deleting usuario:', err)
        return internalError(err.message)
    }
}
