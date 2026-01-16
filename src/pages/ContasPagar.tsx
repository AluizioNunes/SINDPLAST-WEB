import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import { getContasPagar, deleteContaPagar } from '@/lib/services/contaPagarService';
import { ContaPagar } from '@/lib/types/contaPagar';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import ContaPagarModal from '@/components/modals/ContaPagarModal';
import Input from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';

export default function ContasPagar() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('q') || '';
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContaPagar, setSelectedContaPagar] = useState<ContaPagar | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['contasPagar', page, search],
        queryFn: () => getContasPagar({ page, search, limit: 10 }),
        placeholderData: (data) => data,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteContaPagar,
        onSuccess: () => {
            toast.success('Conta excluída com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
        },
        onError: (error) => {
            console.error('Error deleting conta pagar:', error);
            toast.error('Erro ao excluir conta');
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
        if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
        deleteMutation.mutate(id);
    };

    const handleEdit = (conta: ContaPagar) => {
        setSelectedContaPagar(conta);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
        setIsModalOpen(false);
        setSelectedContaPagar(null);
    };

    const columns: ColumnDef<ContaPagar>[] = [
        {
            accessorKey: 'descricao',
            header: 'Descrição',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">{row.original.descricao}</span>
                    <span className="text-xs text-gray-500">{row.original.fornecedor}</span>
                </div>
            ),
        },
        {
            accessorKey: 'valor',
            header: 'Valor',
            cell: ({ row }) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.valor),
        },
        {
            accessorKey: 'vencimento',
            header: 'Vencimento',
            cell: ({ row }) => new Date(row.original.vencimento).toLocaleDateString('pt-BR'),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                let className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ";
                if (status === 'PAGO') className += "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
                else if (status === 'PENDENTE') className += "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
                else className += "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";

                return <span className={className}>{status}</span>;
            },
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contas a Pagar</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gerencie as contas a pagar
                    </p>
                </div>
                <Button onClick={() => { setSelectedContaPagar(null); setIsModalOpen(true); }}>
                    <Plus size={20} className="mr-2" />
                    Nova Conta
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="Buscar por descrição ou fornecedor..."
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

            <ContaPagarModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contaPagar={selectedContaPagar}
                onSave={handleSuccess}
            />
        </div>
    );
}
