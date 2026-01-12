'use server';

import { createClient } from '@/lib/supabase/server';
import { createCentroCusto as createCentroCustoService, updateCentroCusto as updateCentroCustoService, getCentroCustos as getCentroCustosService } from '@/lib/services/centroCustoService';
import { CentroCusto } from '@/lib/types/centroCusto';
import { revalidatePath } from 'next/cache';
import { centroCustoSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function getCentroCustosList() {
    try {
        await requireUser();
        const { data } = await getCentroCustosService({ limit: 1000 });
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching centro custos list:', error);
        return { success: false, error: 'Falha ao buscar centros de custo' };
    }
}

export async function deleteCentroCusto(id: number) {
    const supabase = await createClient();

    // Verifica autenticação
    await requireAdmin();

    const { error } = await supabase
        .from('CentroCustos')
        .delete()
        .eq('IdCentroCusto', id);

    if (error) {
        console.error('Error deleting centro custo:', error);
        return { success: false, error: 'Falha ao excluir centro de custo' };
    }

    revalidatePath('/centro-custos');
    return { success: true };
}

export async function createCentroCusto(data: Partial<CentroCusto>) {
    try {
        await requireUser();
        const validation = centroCustoSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await createCentroCustoService(validation.data as Partial<CentroCusto>);
        revalidatePath('/centro-custos');
        return { success: true };
    } catch (error) {
        console.error('Error creating centro custo:', error);
        return { success: false, error: 'Falha ao criar centro de custo' };
    }
}

export async function updateCentroCusto(id: number, data: Partial<CentroCusto>) {
    try {
        await requireUser();
        const validation = centroCustoSchema.partial().safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        await updateCentroCustoService(id, validation.data as Partial<CentroCusto>);
        revalidatePath('/centro-custos');
        return { success: true };
    } catch (error) {
        console.error('Error updating centro custo:', error);
        return { success: false, error: 'Falha ao atualizar centro de custo' };
    }
}
