'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Socio } from '@/lib/types/socio';
import SocioModal from '@/components/modals/SocioModal';
import DataTable from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';

export default function SociosPage() {
    const [socios, setSocios] = useState<Socio[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);

    useEffect(() => {
        loadSocios();
    }, []);

    const loadSocios = async () => {
        try {
            const response = await fetch('/api/socios');
            if (!response.ok) throw new Error('Failed to fetch socios');
            const data = await response.json();
            setSocios(data);
        } catch (error) {
            console.error('Error loading socios:', error);
            toast.error('Erro ao carregar sócios');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este sócio?')) return;

        try {
            const response = await fetch(`/api/socios/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete socio');

            toast.success('Sócio excluído com sucesso!');
            loadSocios();
        } catch (error) {
            console.error('Error deleting socio:', error);
            toast.error('Erro ao excluir sócio');
        }
    };

    const columns = useMemo<ColumnDef<Socio>[]>(() => [
        {
            accessorKey: 'matricula',
            header: 'Matrícula',
            cell: (info: any) => info.getValue() || '-',
        },
        {
            accessorKey: 'nome',
            header: 'Nome',
            cell: (info: any) => (
                <span className="font-bold text-gray-900 dark:text-white uppercase text-xs">
                    {info.getValue() as string}
                </span>
            ),
        },
        {
            accessorKey: 'cpf',
            header: 'CPF',
            cell: (info: any) => info.getValue() || '-',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info: any) => {
                const status = info.getValue() as string;
                const isActive = status?.toUpperCase() === 'ATIVO';
                return (
                    <span
                        className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                    >
                        {status || 'INATIVO'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'nomeFantasia',
            header: 'Empresa',
            cell: (info: any) => (
                <span className="text-[10px] text-gray-500 uppercase font-medium">
                    {info.getValue() as string || '-'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }: any) => {
                const socio = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => {
                                setSelectedSocio(socio);
                                setIsModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(socio.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Excluir"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Relatório"
                        >
                            <FileText className="w-4 h-4" />
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
                        Sócios
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerenciar cadastro de sócios do sindicato
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setSelectedSocio(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black rounded-lg shadow-lg hover:shadow-xl transition-all uppercase tracking-wider"
                >
                    <Plus className="w-5 h-5" />
                    Novo Sócio
                </motion.button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="glass-card p-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        Carregando sócios...
                    </div>
                </div>
            ) : (
                <DataTable
                    data={socios}
                    columns={columns}
                    searchPlaceholder="Buscar por nome, CPF ou matrícula..."
                />
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Total de Sócios</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {socios.length}
                    </p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-green-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Ativos</p>
                    <p className="text-2xl font-black text-green-600">
                        {socios.filter((s) => s.status?.toUpperCase() === 'ATIVO').length}
                    </p>
                </div>
                <div className="glass-card p-4 border-l-4 border-l-red-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">Inativos</p>
                    <p className="text-2xl font-black text-red-600">
                        {socios.filter((s) => s.status?.toUpperCase() !== 'ATIVO').length}
                    </p>
                </div>
            </div>

            <SocioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadSocios}
                socio={selectedSocio}
            />
        </div>
    );
}
