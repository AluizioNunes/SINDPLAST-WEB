import { internalError, ok } from '@/lib/api/http'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()

        const [sociosRes, empresasRes, dependentesRes, usuariosRes] = await Promise.all([
            supabase.from('Socios').select('IdSocio', { head: true, count: 'exact' }),
            supabase.from('Empresas').select('IdEmpresa', { head: true, count: 'exact' }),
            supabase.from('Dependentes').select('IdDependente', { head: true, count: 'exact' }),
            supabase.from('Usuarios').select('IdUsuarios', { head: true, count: 'exact' }),
        ])

        if (sociosRes.error) throw sociosRes.error
        if (empresasRes.error) throw empresasRes.error
        if (dependentesRes.error) throw dependentesRes.error
        if (usuariosRes.error) throw usuariosRes.error

        return ok({
            sociosCount: sociosRes.count ?? 0,
            empresasCount: empresasRes.count ?? 0,
            dependentesCount: dependentesRes.count ?? 0,
            usuariosCount: usuariosRes.count ?? 0,
        })
    } catch (error) {
        const err = error as Error
        console.error('Error loading dashboard stats:', err)
        return internalError(err.message)
    }
}
