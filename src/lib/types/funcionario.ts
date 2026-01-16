export interface Funcionario {
    id: number;
    nome: string;
    salario: number | null;
    cbo: string | null;
    empresaLocal: string | null;
    depto: string | null;
    setor: string | null;
    // Adicionar outros campos conforme necessário, baseando-se no JSON ou uso
    cpf?: string;
    cargo?: string; // Parece ser mapeado de CBO ou outro campo
    dataAdmissao?: string;
    empresaId?: number;
}
