import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Check, ChevronRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { getPerfis } from '@/lib/services/perfilService';
import { getPermissoes, saveAllPermissoes } from '@/lib/services/permissaoService';
import { PermissoesCompleta } from '@/lib/types/permissao';
import { SYSTEM_SCREENS } from '@/config/permissions';
import { SYSTEM_MENU_ITEMS } from '@/config/menu';
import Button from '@/components/ui/Button';
import NavbarListbox from '@/components/ui/NavbarListbox';

export default function PermissoesPage() {
    const [selectedPerfilId, setSelectedPerfilId] = useState<number | null>(null);

    const { data: perfis, isLoading: isLoadingPerfis } = useQuery({
        queryKey: ['perfis'],
        queryFn: getPerfis,
    });

    const perfilOptions = (perfis || []).map((p) => ({
        value: String(p.IdPerfil),
        label: p.Perfil,
    }));

    return (
        <div className="space-y-6 pt-20 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Profiles List (Left) */}
                <div className="col-span-12 md:col-span-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-red-600 to-red-800">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-black text-white uppercase text-sm tracking-wide">Perfis</h2>
                            {isLoadingPerfis ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/80"></div>
                            ) : null}
                        </div>
                        <div className="mt-3">
                            <NavbarListbox
                                value={selectedPerfilId ? String(selectedPerfilId) : undefined}
                                onValueChange={(v) => setSelectedPerfilId(Number(v))}
                                options={perfilOptions}
                                placeholder={isLoadingPerfis ? 'Carregando...' : 'Selecione um perfil'}
                                disabled={isLoadingPerfis || perfilOptions.length === 0}
                            />
                        </div>
                    </div>
                    <div className="flex-1 p-4 text-sm text-gray-600 dark:text-gray-400">
                        {selectedPerfilId ? (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800/40 uppercase">
                                <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200">
                                    <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    Perfil selecionado
                                </div>
                                <div className="mt-2 font-black text-gray-900 dark:text-white">
                                    {perfis?.find((p) => p.IdPerfil === selectedPerfilId)?.Perfil || 'N/A'}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start gap-2">
                                <div className="font-bold uppercase text-gray-700 dark:text-gray-200">Selecione um perfil</div>
                                <div className="text-xs uppercase text-gray-500">Para editar permissões de menus e telas</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Permissions Matrix (Right) */}
                <div className="col-span-12 md:col-span-9 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                    {!selectedPerfilId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Shield className="w-16 h-16 mb-4 opacity-20" />
                            <p className="uppercase font-medium">Selecione um perfil para gerenciar as permissões</p>
                        </div>
                    ) : (
                        <PermissoesEditor perfilId={selectedPerfilId} />
                    )}
                </div>
            </div>
        </div>
    );
}

function PermissoesEditor({ perfilId }: { perfilId: number }) {
    const queryClient = useQueryClient();
    const { data: permissionsData, isLoading: isLoadingPermissions, dataUpdatedAt } = useQuery({
        queryKey: ['permissions', perfilId],
        queryFn: () => getPermissoes(perfilId),
        enabled: !!perfilId,
    });

    if (isLoadingPermissions || !permissionsData) {
        return (
            <div className="flex-1 flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <PermissoesEditorInner
            key={`${perfilId}-${dataUpdatedAt}`}
            perfilId={perfilId}
            initialPermissions={permissionsData}
            queryClient={queryClient}
        />
    );
}

function PermissoesEditorInner({
    perfilId,
    initialPermissions,
    queryClient,
}: {
    perfilId: number;
    initialPermissions: PermissoesCompleta;
    queryClient: ReturnType<typeof useQueryClient>;
}) {
    const shouldAutoSelectAll =
        Object.keys(initialPermissions.menus || {}).length === 0 &&
        Object.keys(initialPermissions.campos || {}).length === 0;

    const buildAllSelectedPermissions = () => {
        const menus: Record<string, boolean> = {};
        SYSTEM_MENU_ITEMS.forEach((m) => {
            menus[m.id] = true;
        });

        const campos: Record<string, Record<string, { visualizar: boolean; editar: boolean }>> = {};
        SYSTEM_SCREENS.forEach((s) => {
            const fields: Record<string, { visualizar: boolean; editar: boolean }> = {};
            s.fields.forEach((f) => {
                fields[f.id] = { visualizar: true, editar: true };
            });
            campos[s.id] = fields;
        });

        return { menus, campos };
    };

    const [activeTab, setActiveTab] = useState<'menus' | 'telas'>('menus');
    const [expandedScreens, setExpandedScreens] = useState<string[]>(() =>
        shouldAutoSelectAll ? SYSTEM_SCREENS.map((s) => s.id) : [],
    );
    const [localPermissions, setLocalPermissions] = useState<PermissoesCompleta>(() =>
        shouldAutoSelectAll ? buildAllSelectedPermissions() : initialPermissions,
    );
    const [hasChanges, setHasChanges] = useState(() => shouldAutoSelectAll);

    const allMenusSelected = useMemo(() => {
        return SYSTEM_MENU_ITEMS.every((m) => localPermissions.menus[m.id]);
    }, [localPermissions.menus]);

    const allCamposSelected = useMemo(() => {
        return SYSTEM_SCREENS.every((s) =>
            s.fields.every((f) => {
                const perms = localPermissions.campos[s.id]?.[f.id];
                return perms?.visualizar && perms?.editar;
            }),
        );
    }, [localPermissions.campos]);

    const saveMutation = useMutation({
        mutationFn: () => saveAllPermissoes(perfilId, localPermissions),
        onSuccess: () => {
            toast.success('Permissões salvas com sucesso!');
            setHasChanges(false);
            queryClient.invalidateQueries({ queryKey: ['permissions', perfilId] });
        },
        onError: () => toast.error('Erro ao salvar permissões'),
    });

    const toggleScreen = (screenId: string) => {
        setExpandedScreens((prev) =>
            prev.includes(screenId) ? prev.filter((id) => id !== screenId) : [...prev, screenId]
        );
    };

    const menuToScreens: Record<string, string[]> = {
        socios: ['socios'],
        empresas: ['empresas'],
        dependentes: ['dependentes'],
        funcionarios: ['funcionarios'],
        'contas-pagar': ['financeiro'],
        'contas-receber': ['financeiro'],
    };

    const getScreensForMenu = (menuId: string) => {
        const inferredScreens = SYSTEM_SCREENS.some((s) => s.id === menuId) ? [menuId] : [];
        return menuToScreens[menuId] || inferredScreens;
    };

    const selectAllMenus = () => {
        setLocalPermissions((prev) => {
            const nextMenus: Record<string, boolean> = { ...prev.menus };
            const screensToEnable = new Set<string>();

            SYSTEM_MENU_ITEMS.forEach((m) => {
                nextMenus[m.id] = true;
                getScreensForMenu(m.id).forEach((s) => screensToEnable.add(s));
            });

            const nextCampos = { ...prev.campos };
            screensToEnable.forEach((screenId) => {
                const screen = SYSTEM_SCREENS.find((s) => s.id === screenId);
                if (!screen) return;
                const updatedFields: Record<string, { visualizar: boolean; editar: boolean }> = {};
                screen.fields.forEach((f) => {
                    updatedFields[f.id] = { visualizar: true, editar: true };
                });
                nextCampos[screenId] = updatedFields;
            });

            setExpandedScreens((prevExpanded) => Array.from(new Set([...prevExpanded, ...Array.from(screensToEnable)])));

            return {
                ...prev,
                menus: nextMenus,
                campos: nextCampos,
            };
        });
        setHasChanges(true);
    };

    const selectAllCamposTelas = () => {
        setLocalPermissions((prev) => {
            const nextCampos: Record<string, Record<string, { visualizar: boolean; editar: boolean }>> = {};
            SYSTEM_SCREENS.forEach((s) => {
                const fields: Record<string, { visualizar: boolean; editar: boolean }> = {};
                s.fields.forEach((f) => {
                    fields[f.id] = { visualizar: true, editar: true };
                });
                nextCampos[s.id] = fields;
            });

            setExpandedScreens(SYSTEM_SCREENS.map((s) => s.id));

            return {
                ...prev,
                campos: nextCampos,
            };
        });
        setHasChanges(true);
    };

    const handleMenuToggle = (menuId: string) => {
        setLocalPermissions((prev) => {
            const nextAllowed = !prev.menus[menuId];
            const screens = getScreensForMenu(menuId);

            if (screens.length === 0) {
                return {
                    ...prev,
                    menus: { ...prev.menus, [menuId]: nextAllowed },
                };
            }

            const nextCampos = { ...prev.campos };
            screens.forEach((screenId) => {
                const screen = SYSTEM_SCREENS.find((s) => s.id === screenId);
                if (!screen) return;
                const updatedFields: Record<string, { visualizar: boolean; editar: boolean }> = {};
                screen.fields.forEach((f) => {
                    updatedFields[f.id] = nextAllowed
                        ? { visualizar: true, editar: true }
                        : { visualizar: false, editar: false };
                });
                nextCampos[screenId] = updatedFields;
            });

            if (nextAllowed) {
                setExpandedScreens((prevExpanded) => Array.from(new Set([...prevExpanded, ...screens])));
            }

            return {
                ...prev,
                menus: { ...prev.menus, [menuId]: nextAllowed },
                campos: nextCampos,
            };
        });
        setHasChanges(true);
    };

    const handleFieldToggle = (screenId: string, fieldId: string, type: 'visualizar' | 'editar') => {
        setLocalPermissions((prev) => {
            const screenFields = prev.campos[screenId] || {};
            const fieldPerms = screenFields[fieldId] || { visualizar: false, editar: false };

            const newPerms = { ...fieldPerms, [type]: !fieldPerms[type] };

            if (type === 'editar' && newPerms.editar) {
                newPerms.visualizar = true;
            }
            if (type === 'visualizar' && !newPerms.visualizar) {
                newPerms.editar = false;
            }

            return {
                ...prev,
                campos: {
                    ...prev.campos,
                    [screenId]: {
                        ...screenFields,
                        [fieldId]: newPerms,
                    },
                },
            };
        });
        setHasChanges(true);
    };

    const isMenuAllowed = (menuId: string) => !!localPermissions.menus[menuId];

    const getFieldPermission = (screenId: string, fieldId: string) =>
        localPermissions.campos[screenId]?.[fieldId] || { visualizar: false, editar: false };

    return (
        <>
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-between">
                <h2 className="font-black text-white uppercase text-sm tracking-wide">Permissões</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllMenus}
                        disabled={saveMutation.isPending || allMenusSelected}
                        className="border border-white/20 bg-white/10 text-white hover:bg-white/15 focus:ring-white/20 focus:ring-offset-0"
                    >
                        Selecione todos os itens de menu
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllCamposTelas}
                        disabled={saveMutation.isPending || allCamposSelected}
                        className="border border-white/20 bg-white/10 text-white hover:bg-white/15 focus:ring-white/20 focus:ring-offset-0"
                    >
                        Selecione todos os campos e telas
                    </Button>
                    <Button
                        onClick={() => saveMutation.mutate()}
                        disabled={!hasChanges || saveMutation.isPending}
                        variant={hasChanges ? 'primary' : 'secondary'}
                        size="sm"
                        className={hasChanges ? 'bg-white text-red-700 hover:bg-white/90 focus:ring-white/30 focus:ring-offset-0' : 'focus:ring-offset-0'}
                    >
                        {saveMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('menus')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
                        activeTab === 'menus'
                            ? 'border-red-500 text-red-600 dark:text-red-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Acesso a Menus
                </button>
                <button
                    onClick={() => setActiveTab('telas')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
                        activeTab === 'telas'
                            ? 'border-red-500 text-red-600 dark:text-red-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Campos e Telas
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'menus' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SYSTEM_MENU_ITEMS.map((menu) => {
                            const allowed = isMenuAllowed(menu.id);
                            const Icon = menu.icon;
                            return (
                                <div
                                    key={menu.id}
                                    onClick={() => handleMenuToggle(menu.id)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                                        allowed
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                allowed ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`font-bold uppercase ${allowed ? 'text-red-700' : 'text-gray-600'}`}>
                                            {menu.label}
                                        </span>
                                    </div>
                                    <div
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            allowed ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300'
                                        }`}
                                    >
                                        {allowed && <Check className="w-4 h-4" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'telas' && (
                    <div className="space-y-4">
                        {SYSTEM_SCREENS.map((screen) => (
                            <div key={screen.id} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleScreen(screen.id)}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-colors"
                                >
                                    <span className="font-black uppercase text-white">{screen.label}</span>
                                    <ChevronRight
                                        className={`w-5 h-5 text-white/90 transition-transform ${
                                            expandedScreens.includes(screen.id) ? 'rotate-90' : ''
                                        }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {expandedScreens.includes(screen.id) && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 bg-white dark:bg-gray-900">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 dark:border-gray-800">
                                                            <th className="text-left py-2 font-semibold text-gray-500 uppercase">Campo</th>
                                                            <th className="text-center py-2 font-semibold text-gray-500 uppercase w-32">Visualizar</th>
                                                            <th className="text-center py-2 font-semibold text-gray-500 uppercase w-32">Editar</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {screen.fields.map((field) => {
                                                            const perms = getFieldPermission(screen.id, field.id);
                                                            return (
                                                                <tr
                                                                    key={field.id}
                                                                    className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                                >
                                                                    <td className="py-3 font-medium text-gray-700 dark:text-gray-300 uppercase">
                                                                        {field.label}
                                                                    </td>
                                                                    <td className="py-3 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={perms.visualizar}
                                                                            onChange={() => handleFieldToggle(screen.id, field.id, 'visualizar')}
                                                                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                                        />
                                                                    </td>
                                                                    <td className="py-3 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={perms.editar}
                                                                            onChange={() => handleFieldToggle(screen.id, field.id, 'editar')}
                                                                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
