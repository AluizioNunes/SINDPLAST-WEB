'use server';

import { createClient } from '@/lib/supabase/server';
import { createAtivo as createAtivoService, updateAtivo as updateAtivoService } from '@/lib/services/ativoService';
import { Ativo } from '@/lib/types/ativo';
import { revalidatePath } from 'next/cache';
import { ativoSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function deleteAtivo(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('Ativos')
        .delete()
        .eq('IdAtivo', id);

    if (error) {
        console.error('Error deleting ativo:', error);
        return { success: false, error: 'Falha ao excluir ativo' };
    }

    revalidatePath('/ativos');
    return { success: true };
}

export async function createAtivo(data: Partial<Ativo>) {
    try {
        await requireUser();
        const validation = ativoSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createAtivoService(validation.data as Partial<Ativo>);
        revalidatePath('/ativos');
        return { success: true };
    } catch (error) {
        console.error('Error creating ativo:', error);
        return { success: false, error: 'Falha ao criar ativo' };
    }
}

export async function updateAtivo(id: number, data: Partial<Ativo>) {
    try {
        await requireUser();
        const validation = ativoSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateAtivoService(id, validation.data as Partial<Ativo>);
        revalidatePath('/ativos');
        return { success: true };
    } catch (error) {
        console.error('Error updating ativo:', error);
        return { success: false, error: 'Falha ao atualizar ativo' };
    }
}
