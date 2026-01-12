'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createUsuario as createUsuarioService, updateUsuario as updateUsuarioService } from '@/lib/services/usuarioService';
import { Usuario } from '@/lib/types/usuario';
import { usuarioSchema } from '@/lib/validations/schemas';
import { requireAdmin, requireUser } from '@/lib/auth/server';

export async function createUsuario(data: Omit<Usuario, 'IdUsuarios' | 'DataCadastro'>) {
  try {
    await requireUser();
    const validation = usuarioSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    await createUsuarioService(validation.data as Omit<Usuario, 'IdUsuarios' | 'DataCadastro'>);
    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Error creating usuario:', error);
    return { success: false, error: 'Erro ao criar usuário' };
  }
}

export async function updateUsuario(id: number, data: Partial<Usuario>) {
  try {
    await requireUser();
    const validation = usuarioSchema.partial().safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    await updateUsuarioService(id, validation.data as Partial<Usuario>);
    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Error updating usuario:', error);
    return { success: false, error: 'Erro ao atualizar usuário' };
  }
}

export async function deleteUsuario(id: number) {
  const supabase = await createClient();

  try {
    await requireAdmin();
    const { error } = await supabase
      .from('Usuarios')
      .delete()
      .eq('IdUsuarios', id);

    if (error) throw error;

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Error deleting usuario:', error);
    return { success: false, error: 'Erro ao excluir usuário' };
  }
}
