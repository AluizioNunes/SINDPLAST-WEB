
import { supabase } from '@/lib/supabase';
import { PermissaoMenu, PermissaoCampo, PermissoesCompleta } from '@/lib/types/permissao';

export async function getPermissoes(idPerfil: number): Promise<PermissoesCompleta> {
    // Buscar permissões de menu
    const { data: menusData, error: menusError } = await supabase
        .from('PermissoesMenus')
        .select('*')
        .eq('IdPerfil', idPerfil);

    if (menusError) {
        console.error('Error fetching menu permissions:', menusError);
    }

    // Buscar permissões de campos
    const { data: camposData, error: camposError } = await supabase
        .from('PermissoesCampos')
        .select('*')
        .eq('IdPerfil', idPerfil);

    if (camposError) {
        console.error('Error fetching field permissions:', camposError);
    }

    // Processar Menus
    const menus: Record<string, boolean> = {};
    if (menusData) {
        menusData.forEach((p: PermissaoMenu) => {
            menus[p.MenuId] = p.Acesso;
        });
    }

    // Processar Campos
    const campos: Record<string, Record<string, { visualizar: boolean; editar: boolean }>> = {};
    if (camposData) {
        camposData.forEach((p: PermissaoCampo) => {
            if (!campos[p.TelaId]) campos[p.TelaId] = {};
            campos[p.TelaId][p.CampoId] = {
                visualizar: p.Visualizar,
                editar: p.Editar
            };
        });
    }

    return { menus, campos };
}

export async function savePermissaoMenu(idPerfil: number, menuId: string, acesso: boolean): Promise<void> {
    const { data: existing } = await supabase
        .from('PermissoesMenus')
        .select('IdPermissaoMenu')
        .eq('IdPerfil', idPerfil)
        .eq('MenuId', menuId)
        .single();

    if (existing) {
        await supabase
            .from('PermissoesMenus')
            .update({ Acesso: acesso })
            .eq('IdPermissaoMenu', existing.IdPermissaoMenu);
    } else {
        await supabase
            .from('PermissoesMenus')
            .insert({
                IdPerfil: idPerfil,
                MenuId: menuId,
                Acesso: acesso
            });
    }
}

export async function savePermissaoCampo(
    idPerfil: number, 
    telaId: string, 
    campoId: string, 
    tipo: 'visualizar' | 'editar', 
    valor: boolean
): Promise<void> {
    const { data: existing } = await supabase
        .from('PermissoesCampos')
        .select('*')
        .eq('IdPerfil', idPerfil)
        .eq('TelaId', telaId)
        .eq('CampoId', campoId)
        .single();

    if (existing) {
        const updateData = tipo === 'visualizar' 
            ? { Visualizar: valor } 
            : { Editar: valor };

        await supabase
            .from('PermissoesCampos')
            .update(updateData)
            .eq('IdPermissaoCampo', existing.IdPermissaoCampo);
    } else {
        const insertData = {
            IdPerfil: idPerfil,
            TelaId: telaId,
            CampoId: campoId,
            Visualizar: tipo === 'visualizar' ? valor : false,
            Editar: tipo === 'editar' ? valor : false
        };
        if (tipo === 'editar' && valor === true) insertData.Visualizar = true;

        await supabase
            .from('PermissoesCampos')
            .insert(insertData);
    }
}

export async function saveAllPermissoes(idPerfil: number, permissions: PermissoesCompleta): Promise<void> {
    // 1. Menus - Bulk Upsert
    const menusToUpsert = Object.entries(permissions.menus).map(([menuId, acesso]) => ({
        IdPerfil: idPerfil,
        MenuId: menuId,
        Acesso: acesso
    }));

    if (menusToUpsert.length > 0) {
        const { error } = await supabase.from('PermissoesMenus').upsert(menusToUpsert, { onConflict: 'IdPerfil,MenuId' });

        if (error) {
            console.error('Error saving menus:', JSON.stringify(error, null, 2));

            const { error: deleteError } = await supabase.from('PermissoesMenus').delete().eq('IdPerfil', idPerfil);
            if (deleteError) {
                console.error('Error deleting menus for perfil:', JSON.stringify(deleteError, null, 2));
                throw deleteError;
            }

            const { error: insertError } = await supabase.from('PermissoesMenus').insert(menusToUpsert);
            if (insertError) {
                console.error('Error inserting menus fallback:', JSON.stringify(insertError, null, 2));
                throw insertError;
            }
        }
    }

    // 2. Campos - Bulk Upsert
    const camposToUpsert: any[] = [];
    for (const [telaId, campos] of Object.entries(permissions.campos)) {
        for (const [campoId, perms] of Object.entries(campos)) {
            camposToUpsert.push({
                IdPerfil: idPerfil,
                TelaId: telaId,
                CampoId: campoId,
                Visualizar: perms.visualizar,
                Editar: perms.editar
            });
        }
    }

    if (camposToUpsert.length > 0) {
        const { error } = await supabase.from('PermissoesCampos').upsert(camposToUpsert, { onConflict: 'IdPerfil,TelaId,CampoId' });

        if (error) {
            console.error('Error saving fields:', JSON.stringify(error, null, 2));

            const { error: deleteError } = await supabase.from('PermissoesCampos').delete().eq('IdPerfil', idPerfil);
            if (deleteError) {
                console.error('Error deleting fields for perfil:', JSON.stringify(deleteError, null, 2));
                throw deleteError;
            }

            const { error: insertError } = await supabase.from('PermissoesCampos').insert(camposToUpsert);
            if (insertError) {
                console.error('Error inserting fields fallback:', JSON.stringify(insertError, null, 2));
                throw insertError;
            }
        }
    }
}
