import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { getEmpresas, deleteEmpresa } from '@/lib/services/empresaService';
import { Empresa } from '@/lib/types/empresa';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import EmpresaModal from '@/components/modals/EmpresaModal';
import Input from '@/components/ui/Input';
import { ColumnDef } from '@tanstack/react-table';

export default function Empresas() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('q') || '';
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['empresas', page, search],
        queryFn: () => getEmpresas({ page, search, limit: 10 }),
        placeholderData: (data) => data,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEmpresa,
        onSuccess: () => {
            toast.success('Empresa excluída com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['empresas'] });
        },
        onError: (error) => {
            console.error('Error deleting empresa:', error);
            toast.error('Erro ao excluir empresa');
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
        if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
        deleteMutation.mutate(id);
    };

    const handleEdit = (empresa: Empresa) => {
        setSelectedEmpresa(empresa);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['empresas'] });
        setIsModalOpen(false);
        setSelectedEmpresa(null);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Empresas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gerencie as empresas cadastradas
                    </p>
                </div>
                <Button onClick={() => { setSelectedEmpresa(null); setIsModalOpen(true); }}>
                    <Plus size={20} className="mr-2" />
                    Nova Empresa
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="Buscar por Razão Social, Nome Fantasia ou CNPJ..."
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

            <EmpresaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                empresa={selectedEmpresa}
                onSave={handleSuccess}
            />
        </div>
    );
}
