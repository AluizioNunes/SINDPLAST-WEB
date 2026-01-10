'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Perfil } from '@/lib/types/usuario';
import Button from '@/components/ui/Button';

export default function PerfilPage() {
    const [perfis, setPerfis] = useState<Perfil[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPerfis();
    }, []);

    const loadPerfis = async () => {
        try {
            const response = await fetch('/api/perfis');
            if (!response.ok) throw new Error('Failed to fetch perfis');
            const data = await response.json();
            setPerfis(data);
        } catch (error) {
            console.error('Error loading perfis:', error);
            toast.error('Erro ao carregar perfis');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este perfil?')) return;

        try {
            const response = await fetch(`/api/perfis/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete perfil');

            toast.success('Perfil excluído com sucesso!');
            loadPerfis();
        } catch (error) {
            console.error('Error deleting perfil:', error);
            toast.error('Erro ao excluir perfil');
        }
    };

    const filteredPerfis = perfis.filter((perfil) =>
        perfil.Perfil?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perfil.Descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Perfis de Acesso
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerenciar perfis e níveis de acesso do sistema
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => toast('Modal de cadastro em desenvolvimento', { icon: 'ℹ️' })}
                >
                    Novo Perfil
                </Button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <span className="ml-2 text-gray-500 dark:text-gray-400">Carregando...</span>
                    </div>
                ) : filteredPerfis.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Shield className="w-12 h-12 mx-auto mb-2 opacity-50 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhum perfil encontrado</p>
                    </div>
                ) : (
                    filteredPerfis.map((perfil) => (
                        <motion.div
                            key={perfil.IdPerfil}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <Shield className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toast('Edição em desenvolvimento', { icon: 'ℹ️' })}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(perfil.IdPerfil)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {perfil.Perfil}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {perfil.Descricao || 'Sem descrição'}
                            </p>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cadastrado em: {perfil.DataCadastro ? new Date(perfil.DataCadastro).toLocaleDateString('pt-BR') : '-'}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Stats */}
            <div className="glass-card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Perfis</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {perfis.length}
                </p>
            </div>
        </div>
    );
}
