
// Arquivo de configuração "HOT" para telas e campos
// Adicione novas telas e campos aqui para que apareçam automaticamente na gestão de permissões

export const SYSTEM_SCREENS = [
    {
        id: 'socios',
        label: 'CADASTRO DE SÓCIOS',
        fields: [
            { id: 'matricula', label: 'MATRÍCULA' },
            { id: 'nome', label: 'NOME COMPLETO' },
            { id: 'cpf', label: 'CPF' },
            { id: 'rg', label: 'RG' },
            { id: 'status', label: 'STATUS' },
            { id: 'empresa', label: 'EMPRESA' },
            { id: 'setor', label: 'SETOR' },
            { id: 'dataAdmissao', label: 'DATA ADMISSÃO' },
            { id: 'nascimento', label: 'NASCIMENTO' },
            { id: 'telefone', label: 'TELEFONE' },
            { id: 'celular', label: 'CELULAR' },
            { id: 'cep', label: 'CEP' },
            { id: 'cidade', label: 'CIDADE' },
            { id: 'uf', label: 'UF' },
            { id: 'email', label: 'EMAIL' },
            { id: 'redeSocial', label: 'REDE SOCIAL' },
            { id: 'linkRedeSocial', label: 'LINK REDE SOCIAL' },
            { id: 'funcao', label: 'FUNÇÃO' },
        ]
    },
    {
        id: 'empresas',
        label: 'CADASTRO DE EMPRESAS',
        fields: [
            { id: 'codEmpresa', label: 'CÓDIGO' },
            { id: 'razaoSocial', label: 'RAZÃO SOCIAL' },
            { id: 'nomeFantasia', label: 'NOME FANTASIA' },
            { id: 'cnpj', label: 'CNPJ' },
            { id: 'cidade', label: 'CIDADE' },
            { id: 'uf', label: 'UF' },
            { id: 'nFuncionarios', label: 'Nº FUNCIONÁRIOS' },
        ]
    },
    {
        id: 'funcionarios',
        label: 'CADASTRO DE FUNCIONÁRIOS',
        fields: [
            { id: 'nome', label: 'NOME' },
            { id: 'cpf', label: 'CPF' },
            { id: 'cargo', label: 'CARGO' },
            { id: 'cbo', label: 'CBO' },
            { id: 'empresaLocal', label: 'EMPRESA/LOCAL' },
            { id: 'depto', label: 'DEPARTAMENTO' },
        ]
    },
    {
        id: 'dependentes',
        label: 'CADASTRO DE DEPENDENTES',
        fields: [
            { id: 'nome', label: 'NOME' },
            { id: 'parentesco', label: 'PARENTESCO' },
            { id: 'nascimento', label: 'NASCIMENTO' },
            { id: 'socio', label: 'SÓCIO TITULAR' },
        ]
    },
    {
        id: 'usuarios',
        label: 'CADASTRO DE USUÁRIOS',
        fields: [
            { id: 'nome', label: 'NOME' },
            { id: 'cpf', label: 'CPF' },
            { id: 'funcao', label: 'FUNÇÃO' },
            { id: 'email', label: 'EMAIL' },
            { id: 'usuario', label: 'USUÁRIO (LOGIN)' },
            { id: 'perfil', label: 'PERFIL' },
        ]
    },
    {
        id: 'financeiro',
        label: 'FINANCEIRO (CONTAS)',
        fields: [
            { id: 'valor', label: 'VALOR' },
            { id: 'data_vencimento', label: 'DATA VENCIMENTO' },
            { id: 'categoria', label: 'CATEGORIA' },
            { id: 'status', label: 'STATUS' },
            { id: 'centro_custo', label: 'CENTRO DE CUSTO' },
        ]
    }
];
