import { createClient } from '@/lib/supabase/server';
import { Perfil } from '@/lib/types/usuario';

export async function getPerfis(): Promise<Perfil[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('Perfil')
        .select('*')
        .order('Perfil', { ascending: true });

    if (error) {
        console.error('Error fetching perfis:', error);
        throw new Error('Failed to fetch perfis');
    }

    return data as Perfil[];
}

export async function deletePerfil(id: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('Perfil')
        .delete()
        .eq('IdPerfil', id);

    if (error) {
        console.error('Error deleting perfil:', error);
        throw new Error('Failed to delete perfil');
    }
}
