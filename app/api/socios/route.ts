import { requireAuth } from '@/lib/api/auth'
import { badRequest, created, internalError, ok } from '@/lib/api/http'
import { parseJsonBody } from '@/lib/api/validation'
import { mapSocioRow } from '@/lib/mappers/socio'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('Socios')
            .select('*')
            .order('IdSocio', { ascending: false });

        if (error) throw error

        const socios = (data as Array<Record<string, unknown>>).map(mapSocioRow)
        return ok(socios)
    } catch (error) {
        const err = error as Error
        console.error('Error fetching socios:', err)
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

        if (typeof body.nome !== 'string' || body.nome.trim().length === 0) {
            return badRequest('Field "nome" is required')
        }

        const { data, error } = await supabase
            .from('Socios')
            .insert({
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
            .select()
            .single();

        if (error) throw error

        return created(mapSocioRow(data as unknown as Record<string, unknown>))
    } catch (error) {
        const err = error as Error
        console.error('Error creating socio:', err)
        return internalError(err.message)
    }
}
