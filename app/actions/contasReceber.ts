'use server';

import { createClient } from '@/lib/supabase/server';
import { createContaReceber as createContaReceberService, updateContaReceber as updateContaReceberService } from '@/lib/services/contaReceberService';
import { ContaReceber } from '@/lib/types/contaReceber';
import { revalidatePath } from 'next/cache';
import { contaReceberSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function deleteContaReceber(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('ContasReceber')
        .delete()
        .eq('IdContaReceber', id);

    if (error) {
        console.error('Error deleting conta receber:', error);
        return { success: false, error: 'Falha ao excluir conta a receber' };
    }

    revalidatePath('/contas-receber');
    return { success: true };
}

export async function createContaReceber(data: Partial<ContaReceber>) {
    try {
        await requireUser();
        const validation = contaReceberSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createContaReceberService(validation.data as Partial<ContaReceber>);
        revalidatePath('/contas-receber');
        return { success: true };
    } catch (error) {
        console.error('Error creating conta receber:', error);
        return { success: false, error: 'Falha ao criar conta a receber' };
    }
}

export async function updateContaReceber(id: number, data: Partial<ContaReceber>) {
    try {
        await requireUser();
        const validation = contaReceberSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateContaReceberService(id, validation.data as Partial<ContaReceber>);
        revalidatePath('/contas-receber');
        return { success: true };
    } catch (error) {
        console.error('Error updating conta receber:', error);
        return { success: false, error: 'Falha ao atualizar conta a receber' };
    }
}
