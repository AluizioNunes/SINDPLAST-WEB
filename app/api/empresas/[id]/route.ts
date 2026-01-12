import { requireAuth } from '@/lib/api/auth'
import { badRequest, internalError, noContent, notFound, ok } from '@/lib/api/http'
import { parseJsonBody } from '@/lib/api/validation'
import { mapEmpresaRow } from '@/lib/mappers/empresa'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth()
        if ('response' in auth) return auth.response

        const { id } = await params
        const { data, error } = await auth.supabase
            .from('Empresas')
            .select('*')
            .eq('IdEmpresa', id)
            .single()

        if (error) {
            const anyErr = error as unknown as { code?: string }
            if (anyErr.code === 'PGRST116') return notFound()
            throw error
        }

        return ok(mapEmpresaRow(data as unknown as Record<string, unknown>))
    } catch (error) {
        const err = error as Error
        console.error('Error fetching empresa:', err)
        return internalError(err.message)
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth()
        if ('response' in auth) return auth.response

        const body = await parseJsonBody(request)
        if (!body) return badRequest('Invalid JSON body')

        const { id } = await params

        const { data, error } = await auth.supabase
            .from('Empresas')
            .update({
                CodEmpresa: body.codEmpresa,
                CNPJ: body.cnpj,
                RazaoSocial: body.razaoSocial,
                NomeFantasia: body.nomeFantasia,
                Endereco: body.endereco,
                Numero: body.numero,
                Complemento: body.complemento,
                Bairro: body.bairro,
                CEP: body.cep,
                Cidade: body.cidade,
                UF: body.uf,
                Telefone01: body.telefone01,
                Telefone02: body.telefone02,
                Fax: body.fax,
                Celular: body.celular,
                WhatsApp: body.whatsapp,
                Instagram: body.instagram,
                Linkedin: body.linkedin,
                NFuncionarios: body.nFuncionarios,
                DataContribuicao: body.dataContribuicao,
                ValorContribuicao: body.valorContribuicao,
                Observacao: body.observacao,
            })
            .eq('IdEmpresa', id)
            .select()
            .single()

        if (error) {
            const anyErr = error as unknown as { code?: string }
            if (anyErr.code === 'PGRST116') return notFound()
            throw error
        }

        return ok(mapEmpresaRow(data as unknown as Record<string, unknown>))
    } catch (error) {
        const err = error as Error
        console.error('Error updating empresa:', err)
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
            .from('Empresas')
            .delete()
            .eq('IdEmpresa', id)

        if (error) throw error

        return noContent()
    } catch (error) {
        const err = error as Error
        console.error('Error deleting empresa:', err)
        return internalError(err.message)
    }
}
