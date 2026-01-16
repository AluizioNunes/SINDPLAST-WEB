import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, UserCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import { getDependentes, deleteDependente } from '@/lib/services/dependenteService';
import { Dependente } from '@/lib/types/dependente';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable'; // Note: Original used NoPagination, but we might want pagination if available. Service supports it? Let's check. getDependentes has pagination options.
import DependenteModal from '@/components/modals/DependenteModal';
import Input from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';

export default function Dependentes() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('q') || '';
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDependente, setSelectedDependente] = useState<Dependente | null>(null);
    const [filtro, setFiltro] = useState<'todos' | 'orfaos' | 'sem_empresa'>('todos');

    const { data, isLoading } = useQuery({
        queryKey: ['dependentes', page, search],
        queryFn: () => getDependentes({ page, search, limit: 50 }),
        placeholderData: (data) => data,
    });

    // Client-side filtering as per original component logic, 
    // BUT original component received ALL data or paginated data?
    // Original props: initialData, total, totalPages. So it was server-side paginated.
    // The filter `orfaos` and `sem_empresa` in original `DependenteClientPage` filtered the `dependentes` state array.
    // If `dependentes` only contained the current page, the filter only applied to the current page.
    // However, for correct behavior, these filters should probably be server-side or we accept they only filter current view.
    // Given the original code: `if (filtro === 'orfaos') return dependentes.filter(...)`
    // It seems it only filtered the current page. I will replicate this behavior.

    const filteredDependentes = useMemo(() => {
        const list = data?.data || [];
        if (filtro === 'orfaos') return list.filter(d => d.flagOrfao || !d.codSocio);
        if (filtro === 'sem_empresa') return list.filter(d => !d.empresa || String(d.empresa).trim().length === 0);
        return list;
    }, [data?.data, filtro]);

    const deleteMutation = useMutation({
        mutationFn: deleteDependente,
        onSuccess: () => {
            toast.success('Dependente excluído com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['dependentes'] });
        },
        onError: (error) => {
            console.error('Error deleting dependente:', error);
            toast.error('Erro ao excluir dependente');
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
        if (!confirm('Tem certeza que deseja excluir este dependente?')) return;
        deleteMutation.mutate(id);
    };

    const handleEdit = (dependente: Dependente) => {
        setSelectedDependente(dependente);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['dependentes'] });
        setIsModalOpen(false);
        setSelectedDependente(null);
    };

    const columns: ColumnDef<Dependente>[] = [
        {
            id: 'foto',
            header: 'Foto',
            cell: ({ row }) => {
                const dep = row.original;
                return dep.imagem ? (
                    <div className="relative w-10 h-10">
                        <img
                            src={`/images/dependentes/${dep.imagem}`}
                            alt={dep.dependente || 'Foto do dependente'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
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
            accessorKey: 'parentesco',
            header: 'Parentesco',
            cell: (info: any) => (
                <span className="text-gray-600 dark:text-gray-400 text-xs">
                    {info.getValue() as string}
                </span>
            ),
        },
        {
            accessorKey: 'nascimento',
            header: 'Nascimento',
            cell: ({ row }) => {
                const date = row.original.nascimento;
                if (!date) return '-';
                return new Date(date).toLocaleDateString('pt-BR');
            },
        },
        {
            id: 'socio_info',
            header: 'Sócio',
            cell: ({ row }) => (
                <div className="flex flex-col text-xs">
                    <span className="font-medium text-gray-900 dark:text-white">
                        {row.original.socio || 'N/A'}
                    </span>
                    {/* <span className="text-gray-500">
                        Mat: {row.original.matricula || '-'}
                    </span> */}
                </div>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dependentes</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gerencie os dependentes dos sócios
                    </p>
                </div>
                <Button onClick={() => { setSelectedDependente(null); setIsModalOpen(true); }}>
                    <Plus size={20} className="mr-2" />
                    Novo Dependente
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="Buscar por nome do dependente ou sócio..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value as any)}
                    >
                        <option value="todos">Todos</option>
                        <option value="orfaos">Órfãos</option>
                        <option value="sem_empresa">Sem Empresa</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredDependentes}
                    pageCount={data?.pages || 0}
                    page={page}
                    onPageChange={handlePageChange}
                    total={data?.total || 0}
                />
            )}

            <DependenteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                dependente={selectedDependente}
                onSave={handleSuccess}
            />
        </div>
    );
}
