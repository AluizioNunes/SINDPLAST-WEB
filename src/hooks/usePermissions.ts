import { useQuery } from '@tanstack/react-query';
import { useUser } from './useUser';
import { getPermissoes } from '@/lib/services/permissaoService';

import { PermissoesCompleta } from '@/lib/types/permissao';

export function usePermissions() {
    const { data: user, isLoading: isLoadingUser } = useUser();
    
    const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
        queryKey: ['myPermissions', user?.perfilId],
        queryFn: () => user?.perfilId ? getPermissoes(user.perfilId) : Promise.resolve({ menus: {}, campos: {} } as PermissoesCompleta),
        enabled: !!user?.perfilId,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const isAdmin = user?.perfilNome?.toUpperCase() === 'ADMINISTRADOR' || user?.perfilNome?.toUpperCase() === 'TI';

    const canAccessMenu = (menuId: string) => {
        if (isLoadingUser || isLoadingPermissions) return true; // Fail safe loading? Or false?
        if (isAdmin) return true;
        if (!permissions || !permissions.menus) return false;
        
        // If undefined, it means no explicit rule. Default to FALSE (Closed by default) or TRUE?
        // Given the UI is checkboxes (unchecked = false), it implies default false.
        // However, existing systems usually default to Open until closed.
        // Let's assume STRICT: must be explicitly true.
        return !!permissions.menus[menuId];
    };

    const canViewField = (screenId: string, fieldId: string) => {
        if (isAdmin) return true;
        if (!permissions || !permissions.campos) return false;
        // Check specific field permission
        // If no record exists for the field, should we hide it?
        // Probably yes for strict security.
        return !!permissions.campos[screenId]?.[fieldId]?.visualizar;
    };

    const canEditField = (screenId: string, fieldId: string) => {
        if (isAdmin) return true;
        if (!permissions || !permissions.campos) return false;
        return !!permissions.campos[screenId]?.[fieldId]?.editar;
    };

    return {
        permissions,
        isLoading: isLoadingUser || isLoadingPermissions,
        canAccessMenu,
        canViewField,
        canEditField,
        isAdmin
    };
}
