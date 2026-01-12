'use server';

import { createClient } from '@/lib/supabase/server';
import { createFuncionario as createFuncionarioService, updateFuncionario as updateFuncionarioService } from '@/lib/services/funcionarioService';
import { Funcionario } from '@/lib/types/funcionario';
import { revalidatePath } from 'next/cache';
import { funcionarioSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function deleteFuncionario(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('Funcionarios')
        .delete()
        .eq('FUNCIONARIO_ID', id);

    if (error) {
        console.error('Error deleting funcionario:', error);
        throw new Error('Failed to delete funcionario');
    }

    revalidatePath('/funcionarios');
}

export async function createFuncionario(data: Partial<Funcionario>) {
    try {
        const validation = funcionarioSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createFuncionarioService(validation.data as Partial<Funcionario>);
        revalidatePath('/funcionarios');
        return { success: true };
    } catch (error) {
        console.error('Error creating funcionario:', error);
        return { success: false, error: 'Falha ao criar funcionário' };
    }
}

export async function updateFuncionario(id: number, data: Partial<Funcionario>) {
    try {
        await requireUser();
        const validation = funcionarioSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateFuncionarioService(id, validation.data as Partial<Funcionario>);
        revalidatePath('/funcionarios');
        return { success: true };
    } catch (error) {
        console.error('Error updating funcionario:', error);
        return { success: false, error: 'Falha ao atualizar funcionário' };
    }
}
