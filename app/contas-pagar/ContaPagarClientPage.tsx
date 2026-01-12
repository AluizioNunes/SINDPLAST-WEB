'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ContaPagar } from '@/lib/types/contaPagar';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import ContaPagarModal from '@/components/modals/ContaPagarModal';
import { deleteContaPagar } from '@/app/actions/contasPagar';
import { ColumnDef } from '@tanstack/react-table';

interface ContaPagarClientPageProps {
    initialData: ContaPagar[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export default function ContaPagarClientPage({ initialData, total, totalPages, currentPage }: ContaPagarClientPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [contasPagar, setContasPagar] = useState<ContaPagar[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContaPagar, setSelectedContaPagar] = useState<ContaPagar | null>(null);

    useMemo(() => {
        setContasPagar(initialData);
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
        if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

        try {
            const result = await deleteContaPagar(id);
            if (result.success) {
                toast.success('Conta excluída com sucesso!');
            } else {
                toast.error(result.error || 'Erro ao excluir conta');
            }
        } catch (error) {
            console.error('Error deleting conta pagar:', error);
            toast.error('Erro ao excluir conta');
        }
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
            header: 'Ações',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => {
                            setSelectedContaPagar(row.original);
                            setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original.id)}
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
                        placeholder="Buscar por descrição ou fornecedor..."
                        defaultValue={searchParams.get('q') || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all"
                    />
                </div>

                <Button
                    variant="primary"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => {
                        setSelectedContaPagar(null);
                        setIsModalOpen(true);
                    }}
                    className="whitespace-nowrap"
                >
                    Nova Conta
                </Button>
            </div>

            <div className="glass-card overflow-hidden">
                <DataTable columns={columns} data={contasPagar} />
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

            <ContaPagarModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedContaPagar(null);
                }}
                contaPagar={selectedContaPagar}
                onSave={() => {
                    router.refresh();
                }}
            />
        </div>
    );
}
