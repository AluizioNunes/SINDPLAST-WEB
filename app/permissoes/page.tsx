'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Permissao } from '@/lib/types/usuario';
import Button from '@/components/ui/Button';

export default function PermissoesPage() {
    const [permissoes, setPermissoes] = useState<Permissao[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPermissoes();
    }, []);

    const loadPermissoes = async () => {
        try {
            const response = await fetch('/api/permissoes');
            if (!response.ok) throw new Error('Failed to fetch permissoes');
            const data = await response.json();
            setPermissoes(data);
        } catch (error) {
            console.error('Error loading permissoes:', error);
            toast.error('Erro ao carregar permissões');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta permissão?')) return;

        try {
            const response = await fetch(`/api/permissoes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete permissao');

            toast.success('Permissão excluída com sucesso!');
            loadPermissoes();
        } catch (error) {
            console.error('Error deleting permissao:', error);
            toast.error('Erro ao excluir permissão');
        }
    };

    const filteredPermissoes = permissoes.filter((perm) =>
        perm.Nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.Descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.Tela?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by screen
    const groupedPermissoes = filteredPermissoes.reduce((acc, perm) => {
        const tela = perm.Tela || 'Geral';
        if (!acc[tela]) acc[tela] = [];
        acc[tela].push(perm);
        return acc;
    }, {} as Record<string, Permissao[]>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Permissões
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerenciar permissões e controle de acesso
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => toast('Modal de cadastro em desenvolvimento', { icon: 'ℹ️' })}
                >
                    Nova Permissão
                </Button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, descrição ou tela..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Grouped Permissions */}
            {loading ? (
                <div className="glass-card p-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        Carregando...
                    </div>
                </div>
            ) : Object.keys(groupedPermissoes).length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Lock className="w-12 h-12 mx-auto mb-2 opacity-50 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma permissão encontrada</p>
                </div>
            ) : (
                Object.entries(groupedPermissoes).map(([tela, perms]) => (
                    <div key={tela} className="glass-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-purple-600" />
                            {tela}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {perms.map((perm) => (
                                <motion.div
                                    key={perm.IdPermissao}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 glass-card border-2 border-transparent hover:border-purple-500 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {perm.Nome}
                                        </h3>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toast('Edição em desenvolvimento', { icon: 'ℹ️' })}
                                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(perm.IdPermissao)}
                                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {perm.Descricao || 'Sem descrição'}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Permissões</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {permissoes.length}
                    </p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Telas com Permissões</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {Object.keys(groupedPermissoes).length}
                    </p>
                </div>
            </div>
        </div>
    );
}
