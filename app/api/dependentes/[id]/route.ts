import { requireAuth } from '@/lib/api/auth'
import { internalError, noContent, notFound, ok } from '@/lib/api/http'
import { mapDependenteRow } from '@/lib/mappers/dependente'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth()
        if ('response' in auth) return auth.response

        const { id } = await params

        const { data, error } = await auth.supabase
            .from('Dependentes')
            .select('*')
            .eq('IdDependente', id)
            .single()

        if (error) {
            const anyErr = error as unknown as { code?: string }
            if (anyErr.code === 'PGRST116') return notFound()
            throw error
        }

        return ok(mapDependenteRow(data as unknown as Record<string, unknown>))
    } catch (error) {
        const err = error as Error
        console.error('Error fetching dependente:', err)
        return internalError(err.message)
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth()
        if ('response' in auth) return auth.response

        const { id } = await params

        const { error } = await auth.supabase
            .from('Dependentes')
            .delete()
            .eq('IdDependente', id)

        if (error) throw error

        return noContent()
    } catch (error) {
        const err = error as Error
        console.error('Error deleting dependente:', err)
        return internalError(err.message)
    }
}
