import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import { getCentroCustos, deleteCentroCusto } from '@/lib/services/centroCustoService';
import { CentroCusto } from '@/lib/types/centroCusto';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import CentroCustoModal from '@/components/modals/CentroCustoModal';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';

export default function CentroCustos() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('q') || '';
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCentroCusto, setSelectedCentroCusto] = useState<CentroCusto | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['centroCustos', page, search],
        queryFn: () => getCentroCustos({ page, search, limit: 10 }),
        placeholderData: (data) => data,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCentroCusto,
        onSuccess: () => {
            toast.success('Centro de custo excluído com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['centroCustos'] });
        },
        onError: (error) => {
            console.error('Error deleting centro custo:', error);
            toast.error('Erro ao excluir centro de custo');
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
        if (!confirm('Tem certeza que deseja excluir este centro de custo?')) return;
        deleteMutation.mutate(id);
    };

    const handleEdit = (centroCusto: CentroCusto) => {
        setSelectedCentroCusto(centroCusto);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['centroCustos'] });
        setIsModalOpen(false);
        setSelectedCentroCusto(null);
    };

    const columns: ColumnDef<CentroCusto>[] = [
        {
            accessorKey: 'codigo',
            header: 'Código',
            cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-white">{row.original.codigo}</span>,
        },
        {
            accessorKey: 'descricao',
            header: 'Descrição',
            cell: ({ row }) => <span className="text-gray-900 dark:text-white">{row.original.descricao}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
                        onClick={() => handleDelete(row.original.id)}
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Centros de Custo</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gerencie os centros de custo
                    </p>
                </div>
                <Button onClick={() => { setSelectedCentroCusto(null); setIsModalOpen(true); }}>
                    <Plus size={20} className="mr-2" />
                    Novo Centro de Custo
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="Buscar por descrição..."
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

            <CentroCustoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                centroCusto={selectedCentroCusto}
                onSave={handleSuccess}
            />
        </div>
    );
}
