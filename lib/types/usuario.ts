export interface Usuario {
    IdUsuarios: number;
    Nome: string;
    CPF: string;
    Funcao: string;
    Email: string;
    Usuario: string;
    Perfil: string;
    Cadastrante: string;
    DataCadastro: string;
}

export interface Perfil {
    IdPerfil: number;
    Perfil: string;
    Descricao: string;
    DataCadastro: string;
    Cadastrante: string;
}

export interface Permissao {
    IdPermissao: number;
    Nome: string;
    Descricao: string;
    Tela: string;
    DataCadastro: string;
    Cadastrante: string;
}
