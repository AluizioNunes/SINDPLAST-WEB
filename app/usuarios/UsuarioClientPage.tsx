'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Shield, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Usuario } from '@/lib/types/usuario';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import UsuarioModal from '@/components/modals/UsuarioModal';
import { ColumnDef } from '@tanstack/react-table';
import { deleteUsuario } from '@/app/actions/usuarios';

interface UsuarioClientPageProps {
    initialData: Usuario[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export default function UsuarioClientPage({ initialData, total, totalPages, currentPage }: UsuarioClientPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [usuarios, setUsuarios] = useState<Usuario[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

    useMemo(() => {
        setUsuarios(initialData);
    }, [initialData]);

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

        try {
            const result = await deleteUsuario(id);
            if (result.success) {
                toast.success('Usuário excluído com sucesso!');
                // A atualização da lista acontece via revalidatePath na action
            } else {
                toast.error(result.error || 'Erro ao excluir usuário');
            }
        } catch (error) {
            console.error('Error deleting usuario:', error);
            toast.error('Erro ao excluir usuário');
        }
    };

    const handleEdit = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUsuario(null);
        setIsModalOpen(true);
    };

    const columns: ColumnDef<Usuario>[] = [
        {
            accessorKey: 'Nome',
            header: 'Nome',
        },
        {
            accessorKey: 'Usuario',
            header: 'Usuário',
        },
        {
            accessorKey: 'Email',
            header: 'Email',
        },
        {
            accessorKey: 'Perfil',
            header: 'Perfil',
            cell: ({ row }) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    <Shield className="w-3 h-3 mr-1" />
                    {row.original.Perfil}
                </span>
            ),
        },
        {
            accessorKey: 'Funcao',
            header: 'Função',
            cell: ({ row }) => row.original.Funcao || '-',
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.IdUsuarios)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4">
                <div className="w-full md:w-1/3 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome, usuário ou email..."
                        defaultValue={searchParams.get('q') || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all"
                    />
                </div>

                <Button
                    variant="primary"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={handleCreate}
                    className="whitespace-nowrap"
                >
                    Novo Usuário
                </Button>
            </div>

            <div className="glass-card overflow-hidden">
                <DataTable columns={columns} data={usuarios} />
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrando página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPages}</span> ({total} registros)
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                        Próxima
                    </button>
                </div>
            </div>

            <UsuarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => router.refresh()}
                usuario={selectedUsuario}
            />
        </div>
    );
}
