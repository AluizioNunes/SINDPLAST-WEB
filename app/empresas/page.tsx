'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Empresa } from '@/lib/types/empresa';
import Button from '@/components/ui/Button';
import EmpresaModal from '@/components/modals/EmpresaModal';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

    useEffect(() => {
        loadEmpresas();
    }, []);

    const loadEmpresas = async () => {
        try {
            const response = await fetch('/api/empresas');
            if (!response.ok) throw new Error('Failed to fetch empresas');
            const data = await response.json();
            setEmpresas(data);
        } catch (error) {
            console.error('Error loading empresas:', error);
            toast.error('Erro ao carregar empresas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

        try {
            const response = await fetch(`/api/empresas/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete empresa');

            toast.success('Empresa excluída com sucesso!');
            loadEmpresas();
        } catch (error) {
            console.error('Error deleting empresa:', error);
            toast.error('Erro ao excluir empresa');
        }
    };

    const handleEdit = (empresa: Empresa) => {
        setSelectedEmpresa(empresa);
        setModalOpen(true);
    };

    const handleNew = () => {
        setSelectedEmpresa(null);
        setModalOpen(true);
    };

    const columns = useMemo<ColumnDef<Empresa>[]>(() => [
        {
            accessorKey: 'cnpj',
            header: 'CNPJ',
            cell: (info: any) => info.getValue() || '-',
        },
        {
            accessorKey: 'razaoSocial',
            header: 'Razão Social',
            cell: (info: any) => (
                <span className="font-bold text-gray-900 dark:text-white uppercase text-xs">
                    {info.getValue() as string}
                </span>
            ),
        },
        {
            accessorKey: 'nomeFantasia',
            header: 'Nome Fantasia',
            cell: (info: any) => (
                <span className="text-xs text-gray-500 uppercase font-medium">
                    {info.getValue() as string || '-'}
                </span>
            ),
        },
        {
            id: 'localizacao',
            header: 'Cidade/UF',
            accessorFn: (row) => row.cidade && row.uf ? `${row.cidade}/${row.uf}` : '-',
            cell: (info: any) => (
                <span className="text-xs text-gray-500 uppercase">
                    {info.getValue()}
                </span>
            ),
        },
        {
            accessorKey: 'nFuncionarios',
            header: 'Funcionários',
            cell: (info: any) => (
                <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 dark:text-white">
                        {info.getValue() || 0}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Colab.</span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }: any) => {
                const empresa = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => handleEdit(empresa)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(empresa.id)}
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Empresas
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerenciar cadastro de empresas
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={handleNew}
                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black uppercase tracking-wider shadow-lg"
                >
                    Nova Empresa
                </Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="glass-card p-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        Carregando empresas...
                    </div>
                </div>
            ) : (
                <DataTable
                    data={empresas}
                    columns={columns}
                    searchPlaceholder="Buscar por razão social, nome fantasia ou CNPJ..."
                />
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 border-l-4 border-l-red-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Total de Empresas</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {empresas.length}
                    </p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-teal-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Total de Funcionários</p>
                    <p className="text-2xl font-black text-teal-600">
                        {empresas.reduce((sum, e) => sum + (e.nFuncionarios || 0), 0)}
                    </p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-purple-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Contribuição Mensal</p>
                    <p className="text-2xl font-black text-purple-600">
                        R$ {empresas.reduce((sum, e) => sum + (e.valorContribuicao || 0), 0).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Modal */}
            <EmpresaModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedEmpresa(null);
                }}
                empresa={selectedEmpresa}
                onSave={loadEmpresas}
            />
        </div>
    );
}
