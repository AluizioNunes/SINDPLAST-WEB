import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Usuario } from '@/lib/types/usuario';
import { useAuth } from '@/contexts/AuthContext';

export interface UserWithDetails {
    id: string;
    email?: string;
    details?: Usuario;
    perfilId?: number;
    perfilNome?: string;
}

export function useUser() {
    const { user } = useAuth();

    return useQuery<UserWithDetails | null>({
        queryKey: ['currentUser', user?.IdUsuarios],
        queryFn: async () => {
            if (!user) return null;

            let perfilId: number | undefined;
            let perfilNome: string | undefined;

            if (user.Perfil) {
                perfilNome = user.Perfil;
                // Fetch Profile ID
                const { data: perfil } = await supabase
                    .from('Perfil')
                    .select('IdPerfil')
                    .ilike('Perfil', user.Perfil)
                    .maybeSingle();
                
                if (perfil) {
                    perfilId = perfil.IdPerfil;
                }
            }

            return {
                id: user.IdUsuarios.toString(),
                email: user.Email,
                details: user,
                perfilId,
                perfilNome
            };
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
}
