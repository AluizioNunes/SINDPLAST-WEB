import { z } from 'zod';

// Helper for empty string to undefined/null
const emptyToNull = (val: unknown) => {
    if (typeof val === 'string' && val.trim() === '') return null;
    return val;
};

export const socioSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
    rg: z.string().optional().nullable(),
    emissor: z.string().optional().nullable(),
    nascimento: z.string().optional().nullable(),
    sexo: z.string().optional().nullable(),
    estadoCivil: z.string().optional().nullable(),
    nacionalidade: z.string().optional().nullable(),
    nomeMae: z.string().optional().nullable(),
    nomePai: z.string().optional().nullable(),
    // Endereço
    cep: z.string().optional().nullable(),
    endereco: z.string().optional().nullable(),
    numero: z.string().optional().nullable(),
    complemento: z.string().optional().nullable(),
    bairro: z.string().optional().nullable(),
    cidade: z.string().optional().nullable(),
    uf: z.string().optional().nullable(),
    // Dados Profissionais
    codEmpresa: z.coerce.number().optional().nullable(), // coerce allows string numbers
    matricula: z.coerce.number().optional().nullable(),
    dataAdmissao: z.string().optional().nullable(),
    funcao: z.string().optional().nullable(),
    setor: z.string().optional().nullable(),
    salario: z.coerce.number().optional().nullable(),
    ctps: z.string().optional().nullable(),
    serie: z.string().optional().nullable(),
    // Contato
    telefone: z.string().optional().nullable(),
    celular: z.string().optional().nullable(),
    email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
    // Outros
    status: z.string().optional().default('ATIVO'),
    observacao: z.string().optional().nullable(),
    valorMensalidade: z.coerce.number().optional().nullable(),
    
    // Booleans (checkboxes)
    carta: z.boolean().optional(),
    carteira: z.boolean().optional(),
    ficha: z.boolean().optional(),
});

export const empresaSchema = z.object({
    razaoSocial: z.string().min(3, 'Razão Social é obrigatória'),
    nomeFantasia: z.string().optional().nullable(),
    cnpj: z.string().min(14, 'CNPJ inválido'),
    codEmpresa: z.coerce.number().optional().nullable(),
    endereco: z.string().optional().nullable(),
    numero: z.string().optional().nullable(),
    complemento: z.string().optional().nullable(),
    bairro: z.string().optional().nullable(),
    cep: z.string().optional().nullable(),
    cidade: z.string().optional().nullable(),
    uf: z.string().optional().nullable(),
    telefone01: z.string().optional().nullable(),
    telefone02: z.string().optional().nullable(),
    email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
    responsavel: z.string().optional().nullable(),
    nFuncionarios: z.coerce.number().optional().nullable(),
    observacao: z.string().optional().nullable(),
});

export const dependenteSchema = z.object({
    dependente: z.string().min(2, 'Nome do dependente é obrigatório'),
    codSocio: z.coerce.number().min(1, 'Sócio é obrigatório'),
    parentesco: z.string().min(2, 'Parentesco é obrigatório'),
    nascimento: z.string().optional().nullable(),
    status: z.boolean().optional(),
    carteira: z.boolean().optional(),
    flagOrfao: z.boolean().optional(),
});

export const funcionarioSchema = z.object({
    nome: z.string().min(3, 'Nome é obrigatório'),
    cpf: z.string().optional().nullable(),
    cargo: z.string().optional().nullable(),
    salario: z.coerce.number().optional().nullable(),
    dataAdmissao: z.string().optional().nullable(),
    empresaId: z.coerce.number().optional().nullable(),
    cbo: z.string().optional().nullable(),
    empresaLocal: z.string().optional().nullable(),
    depto: z.string().optional().nullable(),
    setor: z.string().optional().nullable(),
});

export const funcaoSchema = z.object({
    descricao: z.string().min(2, 'Descrição é obrigatória'),
    cbo: z.string().optional().nullable(),
    status: z.boolean().optional().default(true),
});

export const ativoSchema = z.object({
    descricao: z.string().min(2, 'Descrição é obrigatória'),
    tipo: z.string().optional().nullable(),
    valor: z.coerce.number().optional().nullable(),
    data_aquisicao: z.string().optional().nullable(),
    status: z.string().optional().default('ATIVO'),
    observacao: z.string().optional().nullable(),
});

export const centroCustoSchema = z.object({
    codigo: z.string().min(1, 'Código é obrigatório'),
    descricao: z.string().min(2, 'Descrição é obrigatória'),
    status: z.boolean().optional().default(true),
});

export const contaPagarSchema = z.object({
    descricao: z.string().min(2, 'Descrição é obrigatória'),
    valor: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
    vencimento: z.string().min(10, 'Data de vencimento é obrigatória'),
    data_pagamento: z.string().optional().nullable(),
    status: z.string().optional().default('PENDENTE'),
    fornecedor: z.string().optional().nullable(),
    centro_custo_id: z.coerce.number().optional().nullable(),
    observacao: z.string().optional().nullable(),
});

export const contaReceberSchema = z.object({
    descricao: z.string().min(2, 'Descrição é obrigatória'),
    valor: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
    vencimento: z.string().min(10, 'Data de vencimento é obrigatória'),
    data_recebimento: z.string().optional().nullable(),
    status: z.string().optional().default('PENDENTE'),
    cliente: z.string().optional().nullable(),
    centro_custo_id: z.coerce.number().optional().nullable(),
    observacao: z.string().optional().nullable(),
});

export const usuarioSchema = z.object({
    Nome: z.string().min(3, 'Nome é obrigatório'),
    Usuario: z.string().min(3, 'Usuário é obrigatório'),
    Email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
    CPF: z.string().optional().nullable(),
    Funcao: z.string().optional().nullable(),
    Perfil: z.string().optional().nullable(),
    Senha: z.string().optional(), // Optional on update
});
