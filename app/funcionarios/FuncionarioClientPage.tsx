'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Funcionario } from '@/lib/types/funcionario';
import { deleteFuncionario } from '@/app/actions/funcionarios';
import FuncionarioModal from '@/components/modals/FuncionarioModal';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface FuncionarioClientPageProps {
    initialData: Funcionario[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export default function FuncionarioClientPage({ initialData, total, totalPages, currentPage }: FuncionarioClientPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [funcionarios, setFuncionarios] = useState<Funcionario[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);

    useMemo(() => {
        setFuncionarios(initialData);
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

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

        try {
            await deleteFuncionario(id);
            toast.success('Funcionário excluído com sucesso!');
            // O router.refresh() é chamado pelo server action revalidatePath, 
            // mas aqui podemos atualizar o estado local ou forçar refresh se necessário.
            // Como usamos revalidatePath, o refresh do router deve trazer os dados novos.
            // Mas para feedback imediato na lista se não houver refresh full page:
            // setFuncionarios(prev => prev.filter(f => f.id !== id)); 
            // Melhor confiar no router.refresh() para consistência com paginação.
            router.refresh();
        } catch (error) {
            console.error('Error deleting funcionario:', error);
            toast.error('Erro ao excluir funcionário');
        }
    };

    const handleEdit = (funcionario: Funcionario) => {
        setSelectedFuncionario(funcionario);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedFuncionario(null);
        setIsModalOpen(true);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const columns: ColumnDef<Funcionario>[] = [
        {
            accessorKey: 'nome',
            header: 'Nome',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">{row.original.nome}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{row.original.cpf}</span>
                </div>
            ),
        },
        {
            accessorKey: 'cargo',
            header: 'Cargo',
            cell: ({ row }) => row.original.cargo || row.original.cbo || '-',
        },
        {
            accessorKey: 'empresaLocal',
            header: 'Local/Empresa',
            cell: ({ row }) => (
                <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400">
                    <span>{row.original.empresaLocal || '-'}</span>
                    <span className="text-xs opacity-75">{row.original.setor ? `Setor: ${row.original.setor}` : ''}</span>
                </div>
            ),
        },
        {
            accessorKey: 'dataAdmissao',
            header: 'Admissão',
            cell: ({ row }) => row.original.dataAdmissao ? new Date(row.original.dataAdmissao).toLocaleDateString('pt-BR') : '-',
        },
        {
            accessorKey: 'salario',
            header: 'Salário',
            cell: ({ row }) => row.original.salario ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.original.salario) : '-',
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
                        placeholder="Buscar por nome..."
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
                    Novo Funcionário
                </Button>
            </div>

            <div className="glass-card overflow-hidden">
                <DataTable columns={columns} data={funcionarios} />
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

            <FuncionarioModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedFuncionario(null);
                }}
                onSave={() => {
                    router.refresh();
                }}
                funcionario={selectedFuncionario}
            />
        </div>
    );
}
