'use server';

import { createClient } from '@/lib/supabase/server';
import { createFuncao as createFuncaoService, updateFuncao as updateFuncaoService } from '@/lib/services/funcaoService';
import { Funcao } from '@/lib/types/funcao';
import { revalidatePath } from 'next/cache';
import { funcaoSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function deleteFuncao(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('Funcoes')
        .delete()
        .eq('IdFuncao', id);

    if (error) {
        console.error('Error deleting funcao:', error);
        return { success: false, error: 'Falha ao excluir função' };
    }

    revalidatePath('/funcoes');
    return { success: true };
}

export async function createFuncao(data: Partial<Funcao>) {
    try {
        await requireUser();
        const validation = funcaoSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createFuncaoService(validation.data as Partial<Funcao>);
        revalidatePath('/funcoes');
        return { success: true };
    } catch (error) {
        console.error('Error creating funcao:', error);
        return { success: false, error: 'Falha ao criar função' };
    }
}

export async function updateFuncao(id: number, data: Partial<Funcao>) {
    try {
        await requireUser();
        const validation = funcaoSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateFuncaoService(id, validation.data as Partial<Funcao>);
        revalidatePath('/funcoes');
        return { success: true };
    } catch (error) {
        console.error('Error updating funcao:', error);
        return { success: false, error: 'Falha ao atualizar função' };
    }
}
