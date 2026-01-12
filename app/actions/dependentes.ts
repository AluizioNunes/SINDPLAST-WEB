'use server';

import { createClient } from '@/lib/supabase/server';
import { createDependente as createDependenteService, updateDependente as updateDependenteService } from '@/lib/services/dependenteService';
import { Dependente } from '@/lib/types/dependente';
import { revalidatePath } from 'next/cache';
import { dependenteSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function deleteDependente(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('Dependentes')
        .delete()
        .eq('IdDependente', id);

    if (error) {
        console.error('Error deleting dependente:', error);
        throw new Error('Failed to delete dependente');
    }

    revalidatePath('/dependentes');
}

export async function createDependente(data: Partial<Dependente>) {
    try {
        await requireUser();
        const validation = dependenteSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createDependenteService(validation.data as Partial<Dependente>);
        revalidatePath('/dependentes');
        return { success: true };
    } catch (error) {
        console.error('Error creating dependente:', error);
        return { success: false, error: 'Falha ao criar dependente' };
    }
}

export async function updateDependente(id: number, data: Partial<Dependente>) {
    try {
        await requireUser();
        const validation = dependenteSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateDependenteService(id, validation.data as Partial<Dependente>);
        revalidatePath('/dependentes');
        return { success: true };
    } catch (error) {
        console.error('Error updating dependente:', error);
        return { success: false, error: 'Falha ao atualizar dependente' };
    }
}
