 import { requireAuth } from '@/lib/api/auth'
import { badRequest, created, internalError, ok } from '@/lib/api/http'
import { parseJsonBody } from '@/lib/api/validation'
import { mapEmpresaRow } from '@/lib/mappers/empresa'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('Empresas')
            .select('*')
            .order('IdEmpresa', { ascending: false })
            .limit(10000); // Remove limite de 1000 padrão do PostgREST

        if (error) throw error

        const empresas = (data as Array<Record<string, unknown>>).map(mapEmpresaRow)
        return ok(empresas)
    } catch (error) {
        const err = error as Error
        console.error('Error fetching empresas:', err)
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

        if (typeof body.razaoSocial !== 'string' || body.razaoSocial.trim().length === 0) {
            return badRequest('Field "razaoSocial" is required')
        }

        const { data, error } = await supabase
            .from('Empresas')
            .insert({
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
                Cadastrante: auth.user.email ?? 'Sistema',
                Observacao: body.observacao,
            })
            .select()
            .single();

        if (error) throw error

        return created(mapEmpresaRow(data as unknown as Record<string, unknown>))
    } catch (error) {
        const err = error as Error
        console.error('Error creating empresa:', err)
        return internalError(err.message)
    }
}
