'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Empresa } from '@/lib/types/empresa';
import Button from '@/components/ui/Button';
import EmpresaModal from '@/components/modals/EmpresaModal';

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredEmpresas = empresas.filter((empresa) =>
        empresa.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.cnpj?.includes(searchTerm)
    );

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
                >
                    Nova Empresa
                </Button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    CNPJ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Razão Social
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nome Fantasia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Cidade/UF
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Funcionários
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            Carregando...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmpresas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        Nenhuma empresa encontrada
                                    </td>
                                </tr>
                            ) : (
                                filteredEmpresas.map((empresa) => (
                                    <motion.tr
                                        key={empresa.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {empresa.cnpj || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {empresa.razaoSocial}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {empresa.nomeFantasia || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {empresa.cidade && empresa.uf ? `${empresa.cidade}/${empresa.uf}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {empresa.nFuncionarios || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Empresas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {empresas.length}
                    </p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Funcionários</p>
                    <p className="text-2xl font-bold text-teal-600">
                        {empresas.reduce((sum, e) => sum + (e.nFuncionarios || 0), 0)}
                    </p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Contribuição Mensal</p>
                    <p className="text-2xl font-bold text-purple-600">
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
