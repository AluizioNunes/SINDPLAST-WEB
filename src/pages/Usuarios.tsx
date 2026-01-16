import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import { getUsuarios, deleteUsuario } from '@/lib/services/usuarioService';
import { Usuario } from '@/lib/types/usuario';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import UsuarioModal from '@/components/modals/UsuarioModal';
import Input from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';

export default function Usuarios() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('q') || '';
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['usuarios', page, search],
        queryFn: () => getUsuarios({ page, search, limit: 10 }),
        placeholderData: (data) => data,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUsuario,
        onSuccess: () => {
            toast.success('Usuário excluído com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        },
        onError: (error) => {
            console.error('Error deleting usuario:', error);
            toast.error('Erro ao excluir usuário');
        },
    });

    const handleSearch = (term: string) => {
        setSearchParams(prev => {
            if (term) prev.set('q', term);
            else prev.delete('q');
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        deleteMutation.mutate(id);
    };

    const handleEdit = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        setIsModalOpen(false);
        setSelectedUsuario(null);
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
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.IdUsuarios)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuários</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gerencie os usuários do sistema
                    </p>
                </div>
                <Button onClick={() => { setSelectedUsuario(null); setIsModalOpen(true); }}>
                    <Plus size={20} className="mr-2" />
                    Novo Usuário
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="Buscar por nome, usuário ou email..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data?.data || []}
                    pageCount={data?.pages || 0}
                    page={page}
                    onPageChange={handlePageChange}
                    total={data?.total || 0}
                />
            )}

            <UsuarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                usuario={selectedUsuario}
                onSave={handleSuccess}
            />
        </div>
    );
}
