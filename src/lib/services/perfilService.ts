import { supabase } from '@/lib/supabase';
import { Perfil } from '@/lib/types/usuario';

export async function getPerfis(): Promise<Perfil[]> {
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

export async function createPerfil(perfilData: Partial<Perfil>): Promise<Perfil> {
    const dbData = {
        Perfil: perfilData.Perfil?.toUpperCase(), // Ensure Uppercase
        Descricao: perfilData.Descricao?.toUpperCase(), // Ensure Uppercase
        Cadastrante: (await supabase.auth.getUser()).data.user?.email || 'SISTEMA',
    };

    const { data, error } = await supabase
        .from('Perfil')
        .insert(dbData)
        .select()
        .single();

    if (error) throw error;
    return data as Perfil;
}

export async function updatePerfil(id: number, perfilData: Partial<Perfil>): Promise<Perfil> {
    const dbData = {
        Perfil: perfilData.Perfil?.toUpperCase(),
        Descricao: perfilData.Descricao?.toUpperCase(),
    };

    const { data, error } = await supabase
        .from('Perfil')
        .update(dbData)
        .eq('IdPerfil', id)
        .select()
        .single();

    if (error) throw error;
    return data as Perfil;
}

export async function deletePerfil(id: number): Promise<void> {
    const { error } = await supabase
        .from('Perfil')
        .delete()
        .eq('IdPerfil', id);

    if (error) {
        console.error('Error deleting perfil:', error);
        throw new Error('Failed to delete perfil');
    }
}
