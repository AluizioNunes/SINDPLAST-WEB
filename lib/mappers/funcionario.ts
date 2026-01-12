import type { Funcionario } from '@/lib/types/funcionario'

export function mapFuncionarioRow(row: Record<string, unknown>): Funcionario {
    return {
        id: (row.id as number) || (row.FUNCIONARIO_ID as number) || (row.IdFuncionario as number) || 0,
        nome: (row.nome as string) || (row.FUNCIONARIO_NOME as string) || (row.Nome as string) || '',
        salario: (row.salario as number) || (row.FUNCIONARIO_SALARIO as number) || (row.Salario as number) || 0,
        cbo: (row.cbo as string) || (row.FUNCIONARIO_CBO as string) || (row.CBO as string) || null,
        empresaLocal: (row.empresaLocal as string) || (row.FUNCIONARIO_EMP_LOCAL as string) || (row.EmpresaLocal as string) || null,
        depto: (row.depto as string) || (row.FUNCIONARIO_DEPTO as string) || (row.Depto as string) || null,
        setor: (row.setor as string) || (row.FUNCIONARIO_SETOR as string) || (row.Setor as string) || null,
        cpf: (row.cpf as string) || (row.CPF as string) || '',
        cargo: (row.cargo as string) || (row.Cargo as string) || (row.FUNCIONARIO_CBO as string) || '',
        dataAdmissao: (row.dataAdmissao as string) || (row.data_admissao as string) || (row.DataAdmissao as string) || undefined,
        empresaId: (row.empresaId as number) || (row.empresa_id as number) || (row.EmpresaId as number) || 0,
    }
}
