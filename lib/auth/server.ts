import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    
    // Fetch profile
    const { data: profile } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('Email', user.email)
        .single();
        
    return { user, profile };
});

export async function requireAdmin() {
    const data = await getCurrentUser();
    
    // Check if authenticated
    if (!data || !data.user) {
        throw new Error('Unauthorized: Please sign in');
    }

    // If profile exists, check for Admin role
    // If no profile exists (e.g. initial setup or mismatch), we might block or allow based on policy.
    // For security, we block if no profile matches the auth user.
    if (!data.profile) {
        throw new Error('Forbidden: User profile not found');
    }
    
    const isAdmin = data.profile.Perfil?.toLowerCase().includes('admin') || 
                    data.profile.Perfil?.toLowerCase().includes('administrador');
                    
    if (!isAdmin) {
        throw new Error('Forbidden: Requires Admin privileges');
    }
    
    return data;
}

export async function requireUser() {
    const data = await getCurrentUser();
    if (!data || !data.user) {
        throw new Error('Unauthorized: Please sign in');
    }
    return data;
}
