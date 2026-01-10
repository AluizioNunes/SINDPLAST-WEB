'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, UserCircle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dependente } from '@/lib/types/dependente';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

export default function DependentesPage() {
    const [dependentes, setDependentes] = useState<Dependente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredDependentes = dependentes.filter((dep) =>
        dep.dependente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.socio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(dep.codSocio)?.includes(searchTerm)
    );

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
                >
                    Novo Dependente
                </Button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome do dependente, sócio ou código..."
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
                                    Foto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Sócio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Parentesco
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nascimento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            Carregando...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDependentes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        Nenhum dependente encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredDependentes.map((dep) => (
                                    <motion.tr
                                        key={dep.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {dep.imagem ? (
                                                <img
                                                    src={`/images/dependentes/${dep.imagem}`}
                                                    alt={dep.dependente}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <UserCircle className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {dep.dependente}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {dep.socio}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {dep.parentesco}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {dep.nascimento ? new Date(dep.nascimento).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={dep.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Dependentes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dependentes.length}
                    </p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ativos</p>
                    <p className="text-2xl font-bold text-green-600">
                        {dependentes.filter((d) => d.status === true).length}
                    </p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Com Carteira</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {dependentes.filter((d) => d.carteira === true).length}
                    </p>
                </div>
            </div>
        </div>
    );
}
