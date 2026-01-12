'use server';

import { createClient } from '@/lib/supabase/server';
import { createEmpresa as createEmpresaService, updateEmpresa as updateEmpresaService } from '@/lib/services/empresaService';
import { Empresa } from '@/lib/types/empresa';
import { revalidatePath } from 'next/cache';
import { empresaSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function deleteEmpresa(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('Empresas')
        .delete()
        .eq('IdEmpresa', id);

    if (error) {
        console.error('Error deleting empresa:', error);
        return { success: false, error: 'Falha ao excluir empresa' };
    }

    revalidatePath('/empresas');
    return { success: true };
}

export async function createEmpresa(data: Partial<Empresa>) {
    try {
        await requireUser();
        const validation = empresaSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createEmpresaService(validation.data as Partial<Empresa>);
        revalidatePath('/empresas');
        return { success: true };
    } catch (error) {
        console.error('Error creating empresa:', error);
        return { success: false, error: 'Falha ao criar empresa' };
    }
}

export async function updateEmpresa(id: number, data: Partial<Empresa>) {
    try {
        await requireUser();
        const validation = empresaSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateEmpresaService(id, validation.data as Partial<Empresa>);
        revalidatePath('/empresas');
        return { success: true };
    } catch (error) {
        console.error('Error updating empresa:', error);
        return { success: false, error: 'Falha ao atualizar empresa' };
    }
}
