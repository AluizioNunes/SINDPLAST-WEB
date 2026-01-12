import { requireAuth } from '@/lib/api/auth'
import { badRequest, created, internalError, ok } from '@/lib/api/http'
import { parseJsonBody } from '@/lib/api/validation'

export async function GET() {
    try {
        const auth = await requireAuth()
        if ('response' in auth) return auth.response

        const supabase = auth.supabase

        const { data, error } = await supabase
            .from('Usuarios')
            .select('*')
            .order('IdUsuarios', { ascending: false });

        if (error) throw error

        return ok(data)
    } catch (error) {
        const err = error as Error
        console.error('Error fetching usuarios:', err)
        return internalError(err.message)
    }
}

export async function POST(request: Request) {
    try {
        const auth = await requireAuth()
        if ('response' in auth) return auth.response

        const supabase = auth.supabase
        const body = await parseJsonBody(request)
        if (!body) return badRequest('Invalid JSON body')

        if (typeof body.Nome !== 'string' || body.Nome.trim().length === 0) {
            return badRequest('Field "Nome" is required')
        }

        const { data, error } = await supabase
            .from('Usuarios')
            .insert({
                Nome: body.Nome,
                CPF: body.CPF,
                Funcao: body.Funcao,
                Email: body.Email,
                Usuario: body.Usuario,
                Perfil: body.Perfil,
                Cadastrante: auth.user.email ?? 'Sistema',
            })
            .select()
            .single();

        if (error) throw error

        return created(data)
    } catch (error) {
        const err = error as Error
        console.error('Error creating usuario:', err)
        return internalError(err.message)
    }
}
