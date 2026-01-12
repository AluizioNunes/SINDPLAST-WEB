'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit, Trash2, UserCircle, Upload, AlertTriangle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dependente } from '@/lib/types/dependente';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable-NoPagination';
import DependenteModal from '@/components/modals/DependenteModal';
import { ColumnDef } from '@tanstack/react-table';
import { deleteDependente } from '@/app/actions/dependentes';

interface DependenteClientPageProps {
    initialData: Dependente[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export default function DependenteClientPage({ initialData, total, totalPages, currentPage }: DependenteClientPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [dependentes, setDependentes] = useState<Dependente[]>(initialData);
    const [filtro, setFiltro] = useState<'todos' | 'orfaos' | 'sem_empresa'>('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDependente, setSelectedDependente] = useState<Dependente | null>(null);

    useMemo(() => {
        setDependentes(initialData);
    }, [initialData]);

    const filteredDependentes = useMemo(() => {
        if (filtro === 'orfaos') return dependentes.filter(d => d.flagOrfao || d.codSocio === null || d.codSocio === undefined);
        if (filtro === 'sem_empresa') return dependentes.filter(d => !d.empresa || String(d.empresa).trim().length === 0);
        return dependentes;
    }, [dependentes, filtro]);

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este dependente?')) return;

        try {
            await deleteDependente(id);
            setDependentes(prev => prev.filter(d => d.id !== id));
            toast.success('Dependente excluído com sucesso!');
        } catch (error) {
            console.error('Error deleting dependente:', error);
            toast.error('Erro ao excluir dependente');
        }
    };

    const handleEdit = (dependente: Dependente) => {
        setSelectedDependente(dependente);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedDependente(null);
        setIsModalOpen(true);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const columns = useMemo<ColumnDef<Dependente>[]>(() => [
        {
            id: 'foto',
            header: 'Foto',
            cell: ({ row }) => {
                const dep = row.original;
                return dep.imagem ? (
                    <div className="relative w-10 h-10">
                        <Image
                            src={`/images/dependentes/${dep.imagem}`}
                            alt={dep.dependente || 'Foto do dependente'}
                            fill
                            className="rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-white shadow-sm">
                        <UserCircle className="w-6 h-6 text-gray-400" />
                    </div>
                );
            },
        },
        {
            accessorKey: 'dependente',
            header: 'Nome',
            cell: (info: any) => (
                <span className="font-bold text-gray-900 dark:text-white uppercase text-xs">
                    {info.getValue() as string}
                </span>
            ),
        },
        {
            accessorKey: 'socio',
            header: 'Sócio',
            cell: (info: any) => (
                <span className="text-xs text-gray-500 uppercase font-medium">
                    {info.getValue() as string}
                </span>
            ),
        },
        {
            id: 'orfao',
            header: 'Consistência',
            cell: ({ row }) => {
                const dep = row.original as Dependente;
                const isOrfao = !!dep.flagOrfao || dep.codSocio === null || dep.codSocio === undefined;
                const semEmpresa = !dep.empresa || String(dep.empresa).trim().length === 0;
                return (
                    <div className="flex gap-1">
                        {isOrfao && (
                            <span className="px-2 py-1 text-[10px] font-bold rounded-full uppercase bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Órfão
                            </span>
                        )}
                        {semEmpresa && (
                            <span className="px-2 py-1 text-[10px] font-bold rounded-full uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                Sem Empresa
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'parentesco',
            header: 'Parentesco',
            cell: (info: any) => (
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full uppercase font-bold text-gray-600 dark:text-gray-400">
                    {info.getValue() as string}
                </span>
            ),
        },
        {
            accessorKey: 'nascimento',
            header: 'Nascimento',
            cell: (info: any) => {
                const val = info.getValue();
                return val ? new Date(val).toLocaleDateString('pt-BR') : '-';
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info: any) => <StatusBadge status={info.getValue()} />,
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }: any) => {
                const dep = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => toast('Upload de imagem em desenvolvimento', { icon: 'ℹ️' })}
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Upload Foto"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => toast('Edição em desenvolvimento', { icon: 'ℹ️' })}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(dep.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Excluir"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <div className="space-y-6">
            {/* Header removed as requested */}
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-4">
                <div className="w-full md:w-1/3 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar dependente..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all"
                        // Implement search logic here if needed or keep existing table search
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filtro === 'todos' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                        onClick={() => setFiltro('todos')}
                    >
                        Todos
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filtro === 'orfaos' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                        onClick={() => setFiltro('orfaos')}
                    >
                        <AlertTriangle className="w-4 h-4 inline-block mr-1" />
                        Órfãos
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filtro === 'sem_empresa' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                        onClick={() => setFiltro('sem_empresa')}
                    >
                        Sem Empresa
                    </button>
                </div>

                <Button onClick={handleCreate} className="whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Dependente
                </Button>
            </div>

            <DataTable columns={columns} data={filteredDependentes} />

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
        </div>
    );
}
