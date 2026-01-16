
export interface PermissaoMenu {
    IdPermissaoMenu?: number;
    IdPerfil: number;
    MenuId: string;
    Acesso: boolean;
}

export interface PermissaoCampo {
    IdPermissaoCampo?: number;
    IdPerfil: number;
    TelaId: string;
    CampoId: string;
    Visualizar: boolean;
    Editar: boolean;
}

export interface PermissoesCompleta {
    menus: Record<string, boolean>; // menuId -> acesso
    campos: Record<string, Record<string, { visualizar: boolean; editar: boolean }>>; // telaId -> campoId -> { view, edit }
}
