import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ColumnDef } from '@tanstack/react-table';

import { getPerfis, deletePerfil } from '@/lib/services/perfilService';
import { Perfil } from '@/lib/types/usuario';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import PerfilModal from '@/components/modals/PerfilModal';

export default function PerfilPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPerfil, setSelectedPerfil] = useState<Perfil | null>(null);

    const { data: perfis, isLoading } = useQuery({
        queryKey: ['perfis'],
        queryFn: getPerfis,
    });

    const deleteMutation = useMutation({
        mutationFn: deletePerfil,
        onSuccess: () => {
            toast.success('Perfil excluído com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['perfis'] });
        },
        onError: (error) => {
            console.error('Error deleting perfil:', error);
            toast.error('Erro ao excluir perfil');
        },
    });

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este perfil?')) return;
        deleteMutation.mutate(id);
    };

    const handleEdit = (perfil: Perfil) => {
        setSelectedPerfil(perfil);
        setIsModalOpen(true);
    };

    const columns: ColumnDef<Perfil>[] = [
        {
            accessorKey: 'IdPerfil',
            header: 'ID',
            cell: ({ row }) => <span className="text-gray-600 dark:text-gray-400">#{row.original.IdPerfil}</span>,
        },
        {
            accessorKey: 'Perfil',
            header: 'PERFIL',
            cell: ({ row }) => <span className="font-bold text-gray-900 dark:text-white uppercase">{row.original.Perfil}</span>,
        },
        {
            accessorKey: 'Descricao',
            header: 'DESCRIÇÃO',
            cell: ({ row }) => <span className="text-gray-600 dark:text-gray-300 uppercase">{row.original.Descricao}</span>,
        },
        {
            id: 'actions',
            header: 'AÇÕES',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(row.original); }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Editar"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(row.original.IdPerfil); }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    const filteredPerfis = (perfis || []).filter((perfil) =>
        perfil.Perfil?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfil.Descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pt-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase">
                        Perfis de Acesso
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 uppercase">
                        Gerenciar perfis e níveis de acesso do sistema
                    </p>
                </div>
                <Button onClick={() => { setSelectedPerfil(null); setIsModalOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Perfil
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4">
                     {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredPerfis}
                            searchPlaceholder="BUSCAR PERFIL..."
                            searchValue={searchTerm}
                            onSearchChange={setSearchTerm}
                        />
                    )}
                </div>
            </div>

            <PerfilModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                perfil={selectedPerfil}
            />
        </div>
    );
}
