
import { requireAuth } from '@/lib/api/auth'
import { badRequest, created, internalError, ok } from '@/lib/api/http'
import { parseJsonBody } from '@/lib/api/validation'
import { mapDependenteRow } from '@/lib/mappers/dependente'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('Dependentes')
            .select('*')
            .order('IdDependente', { ascending: false })
            .limit(10000); // Remove limite de 1000 padrão do PostgREST

        if (error) throw error

        const dependentes = (data as Array<Record<string, unknown>>).map(mapDependenteRow)
        return ok(dependentes)
    } catch (error) {
        const err = error as Error
        console.error('Error fetching dependentes:', err)
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

        const dependente = (body.dependente ?? body.nome) as unknown
        if (typeof dependente !== 'string' || dependente.trim().length === 0) {
            return badRequest('Field "dependente" is required')
        }

        let empresa: string | null = typeof body.empresa === 'string' ? body.empresa : null
        const codSocio = body.codSocio as unknown
        if (!empresa && (typeof codSocio === 'string' || typeof codSocio === 'number')) {
            const matricula = String(codSocio)
            const socioRes = await supabase
                .from('Socios')
                .select('RazaoSocial')
                .eq('Matricula', matricula)
                .maybeSingle()

            if (!socioRes.error) {
                empresa = (socioRes.data?.RazaoSocial as string) ?? null
            }
        }

        const { data, error } = await supabase
            .from('Dependentes')
            .insert({
                CodSocio: body.codSocio,
                Socio: body.socio,
                Empresa: empresa,
                Dependente: dependente,
                Nascimento: body.nascimento,
                Parentesco: body.parentesco,
                Carteira: body.carteira,
                Status: body.status ?? true,
                Cadastrante: auth.user.email ?? 'Sistema',
            })
            .select()
            .single();

        if (error) throw error

        return created(mapDependenteRow(data as unknown as Record<string, unknown>))
    } catch (error) {
        const err = error as Error
        console.error('Error creating dependente:', err)
        return internalError(err.message)
    }
}
