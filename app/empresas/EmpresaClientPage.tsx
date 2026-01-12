'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Shield, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Empresa } from '@/lib/types/empresa';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import EmpresaModal from '@/components/modals/EmpresaModal';
import { deleteEmpresa } from '@/app/actions/empresas';
import { ColumnDef } from '@tanstack/react-table';

interface EmpresaClientPageProps {
    initialData: Empresa[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export default function EmpresaClientPage({ initialData, total, totalPages, currentPage }: EmpresaClientPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [empresas, setEmpresas] = useState<Empresa[]>(initialData);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

    useMemo(() => {
        setEmpresas(initialData);
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
        if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

        try {
            const result = await deleteEmpresa(id);
            if (result.success) {
                toast.success('Empresa excluída com sucesso!');
            } else {
                toast.error(result.error || 'Erro ao excluir empresa');
            }
        } catch (error) {
            console.error('Error deleting empresa:', error);
            toast.error('Erro ao excluir empresa');
        }
    };

    const columns: ColumnDef<Empresa>[] = [
        {
            accessorKey: 'codEmpresa',
            header: 'Código',
            cell: ({ row }) => <span className="font-medium text-gray-900 dark:text-white">{row.original.codEmpresa}</span>,
        },
        {
            accessorKey: 'razaoSocial',
            header: 'Razão Social',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">{row.original.razaoSocial}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.original.nomeFantasia}</span>
                </div>
            ),
        },
        {
            accessorKey: 'cnpj',
            header: 'CNPJ',
        },
        {
            accessorKey: 'cidade',
            header: 'Cidade/UF',
            cell: ({ row }) => `${row.original.cidade}/${row.original.uf}`,
        },
        {
            accessorKey: 'nFuncionarios',
            header: 'Funcionários',
            cell: ({ row }) => (
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{row.original.nFuncionarios || 0}</span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => {
                            setSelectedEmpresa(row.original);
                            setModalOpen(true);
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
                        placeholder="Buscar por razão social, CNPJ ou código..."
                        defaultValue={searchParams.get('q') || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all"
                    />
                </div>

                <Button
                    variant="primary"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => {
                        setSelectedEmpresa(null);
                        setModalOpen(true);
                    }}
                    className="whitespace-nowrap"
                >
                    Nova Empresa
                </Button>
            </div>

            <div className="glass-card overflow-hidden">
                <DataTable columns={columns} data={empresas} />
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

            <EmpresaModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedEmpresa(null);
                }}
                empresa={selectedEmpresa}
                onSave={() => {
                    // A atualização da lista acontece via revalidatePath na action, 
                    // mas podemos forçar um refresh se necessário. 
                    // Como o estado local 'empresas' é atualizado via prop 'initialData' e router.refresh() implícito,
                    // isso deve funcionar. Se não, window.location.reload().
                    router.refresh();
                }}
            />
        </div>
    );
}
