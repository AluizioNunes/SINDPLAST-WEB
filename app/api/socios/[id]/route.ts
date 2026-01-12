 import { requireAuth } from '@/lib/api/auth'
 import { badRequest, internalError, noContent, notFound, ok } from '@/lib/api/http'
 import { parseJsonBody } from '@/lib/api/validation'
 import { mapSocioRow } from '@/lib/mappers/socio'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAuth()
        if ('response' in auth) return auth.response

        const { id } = await params

        const { data, error } = await auth.supabase
            .from('Socios')
            .select('*')
            .eq('IdSocio', id)
            .single()

        if (error) {
            const anyErr = error as unknown as { code?: string }
            if (anyErr.code === 'PGRST116') return notFound()
            throw error
        }

        return ok(mapSocioRow(data as unknown as Record<string, unknown>))
    } catch (error) {
        const err = error as Error
        console.error('Error fetching socio:', err)
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

        const { id } = await params
        const body = await parseJsonBody(request)
        if (!body) return badRequest('Invalid JSON body')

        const { data, error } = await auth.supabase
            .from('Socios')
            .update({
                Nome: body.nome,
                RG: body.rg,
                Emissor: body.emissor,
                CPF: body.cpf,
                Nascimento: body.nascimento,
                Sexo: body.sexo,
                Naturalidade: body.naturalidade,
                NaturalidadeUF: body.naturalidadeUF,
                Nacionalidade: body.nacionalidade,
                EstadoCivil: body.estadoCivil,
                Endereco: body.endereco,
                Complemento: body.complemento,
                Bairro: body.bairro,
                CEP: body.cep,
                Celular: body.celular,
                RedeSocial: body.redeSocial,
                Pai: body.pai,
                Mae: body.mae,
                Cadastrante: auth.user.email ?? 'Sistema',
                Status: body.status,
                Matricula: body.matricula,
                DataMensalidade: body.dataMensalidade,
                ValorMensalidade: body.valorMensalidade,
                DataAdmissao: body.dataAdmissao,
                CTPS: body.ctps,
                Funcao: body.funcao,
                CodEmpresa: body.codEmpresa,
                CNPJ: body.cnpj,
                RazaoSocial: body.razaoSocial,
                NomeFantasia: body.nomeFantasia,
                DataDemissao: body.dataDemissao,
                MotivoDemissao: body.motivoDemissao,
                Carta: body.carta,
                Carteira: body.carteira,
                Ficha: body.ficha,
                Observacao: body.observacao,
                Telefone: body.telefone,
            })
            .eq('IdSocio', id)
            .select()
            .single()

        if (error) {
            const anyErr = error as unknown as { code?: string }
            if (anyErr.code === 'PGRST116') return notFound()
            throw error
        }

        return ok(mapSocioRow(data as unknown as Record<string, unknown>))
    } catch (error) {
        const err = error as Error
        console.error('Error updating socio:', err)
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
            .from('Socios')
            .delete()
            .eq('IdSocio', id)

        if (error) throw error

        return noContent()
    } catch (error) {
        const err = error as Error
        console.error('Error deleting socio:', err)
        return internalError(err.message)
    }
}
