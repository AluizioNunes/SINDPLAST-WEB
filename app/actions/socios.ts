'use server';

import { createClient } from '@/lib/supabase/server';
import { createSocio as createSocioService, updateSocio as updateSocioService } from '@/lib/services/socioService';
import { Socio } from '@/lib/types/socio';
import { revalidatePath } from 'next/cache';
import { socioSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function deleteSocio(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('Socios')
        .delete()
        .eq('IdSocio', id);

    if (error) {
        console.error('Error deleting socio:', error);
        return { success: false, error: 'Falha ao excluir sócio' };
    }

    revalidatePath('/socios');
    return { success: true };
}

export async function createSocio(data: Partial<Socio>) {
    try {
        await requireUser();
        const validation = socioSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createSocioService(validation.data as Partial<Socio>);
        revalidatePath('/socios');
        return { success: true };
    } catch (error) {
        console.error('Error creating socio:', error);
        return { success: false, error: 'Falha ao criar sócio' };
    }
}

export async function updateSocio(id: number, data: Partial<Socio>) {
    try {
        await requireUser();
        const validation = socioSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateSocioService(id, validation.data as Partial<Socio>);
        revalidatePath('/socios');
        return { success: true };
    } catch (error) {
        console.error('Error updating socio:', error);
        return { success: false, error: 'Falha ao atualizar sócio' };
    }
}
