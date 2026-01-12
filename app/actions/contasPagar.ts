'use server';

import { createClient } from '@/lib/supabase/server';
import { createContaPagar as createContaPagarService, updateContaPagar as updateContaPagarService } from '@/lib/services/contaPagarService';
import { ContaPagar } from '@/lib/types/contaPagar';
import { revalidatePath } from 'next/cache';
import { contaPagarSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function deleteContaPagar(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('ContasPagar')
        .delete()
        .eq('IdContaPagar', id);

    if (error) {
        console.error('Error deleting conta pagar:', error);
        return { success: false, error: 'Falha ao excluir conta a pagar' };
    }

    revalidatePath('/contas-pagar');
    return { success: true };
}

export async function createContaPagar(data: Partial<ContaPagar>) {
    try {
        await requireUser();
        const validation = contaPagarSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createContaPagarService(validation.data as Partial<ContaPagar>);
        revalidatePath('/contas-pagar');
        return { success: true };
    } catch (error) {
        console.error('Error creating conta pagar:', error);
        return { success: false, error: 'Falha ao criar conta a pagar' };
    }
}

export async function updateContaPagar(id: number, data: Partial<ContaPagar>) {
    try {
        await requireUser();
        const validation = contaPagarSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateContaPagarService(id, validation.data as Partial<ContaPagar>);
        revalidatePath('/contas-pagar');
        return { success: true };
    } catch (error) {
        console.error('Error updating conta pagar:', error);
        return { success: false, error: 'Falha ao atualizar conta a pagar' };
    }
}
