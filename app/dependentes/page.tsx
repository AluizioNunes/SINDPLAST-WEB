'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, UserCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dependente } from '@/lib/types/dependente';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';

export default function DependentesPage() {
    const [dependentes, setDependentes] = useState<Dependente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDependentes();
    }, []);

    const loadDependentes = async () => {
        try {
            const response = await fetch('/api/dependentes');
            if (!response.ok) throw new Error('Failed to fetch dependentes');
            const data = await response.json();
            setDependentes(data);
        } catch (error) {
            console.error('Error loading dependentes:', error);
            toast.error('Erro ao carregar dependentes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este dependente?')) return;

        try {
            const response = await fetch(`/api/dependentes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete dependente');

            toast.success('Dependente excluído com sucesso!');
            loadDependentes();
        } catch (error) {
            console.error('Error deleting dependente:', error);
            toast.error('Erro ao excluir dependente');
        }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Dependentes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerenciar cadastro de dependentes dos sócios
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => toast('Modal de cadastro em desenvolvimento', { icon: 'ℹ️' })}
                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black uppercase tracking-wider shadow-lg"
                >
                    Novo Dependente
                </Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="glass-card p-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        Carregando dependentes...
                    </div>
                </div>
            ) : (
                <DataTable
                    data={dependentes}
                    columns={columns}
                    searchPlaceholder="Buscar por nome do dependente, sócio ou código..."
                />
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 border-l-4 border-l-red-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Total de Dependentes</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {dependentes.length}
                    </p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-green-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Ativos</p>
                    <p className="text-2xl font-black text-green-600">
                        {dependentes.filter((d) => d.status === true).length}
                    </p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-purple-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Com Carteira</p>
                    <p className="text-2xl font-black text-purple-600">
                        {dependentes.filter((d) => d.carteira === true).length}
                    </p>
                </div>
            </div>
        </div>
    );
}
