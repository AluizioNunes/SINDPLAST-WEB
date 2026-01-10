'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

interface Funcionario {
    id: number;
    nome: string;
    cpf: string;
    cargo: string;
    data_admissao: string;
    salario: number;
    empresa_id: number;
}

export default function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFuncionarios();
    }, []);

    const loadFuncionarios = async () => {
        try {
            const response = await fetch('/api/funcionarios');
            if (!response.ok) throw new Error('Failed to fetch funcionarios');
            const data = await response.json();
            setFuncionarios(data);
        } catch (error) {
            console.error('Error loading funcionarios:', error);
            toast.error('Erro ao carregar funcionários');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

        try {
            const response = await fetch(`/api/funcionarios/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete funcionario');

            toast.success('Funcionário excluído com sucesso!');
            loadFuncionarios();
        } catch (error) {
            console.error('Error deleting funcionario:', error);
            toast.error('Erro ao excluir funcionário');
        }
    };

    const filteredFuncionarios = funcionarios.filter((func) =>
        func.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        func.cpf?.includes(searchTerm) ||
        func.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Funcionários
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gerenciar cadastro de funcionários
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-5 h-5" />}
                    onClick={() => toast('Modal de cadastro em desenvolvimento', { icon: 'ℹ️' })}
                >
                    Novo Funcionário
                </Button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, CPF ou cargo..."
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
                                    Nome
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    CPF
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Cargo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Admissão
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Salário
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
                            ) : filteredFuncionarios.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        Nenhum funcionário encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredFuncionarios.map((func) => (
                                    <motion.tr
                                        key={func.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {func.nome}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {func.cpf}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {func.cargo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {func.data_admissao ? new Date(func.data_admissao).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {func.salario ? `R$ ${func.salario.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toast('Edição em desenvolvimento', { icon: 'ℹ️' })}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(func.id)}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Funcionários</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {funcionarios.length}
                    </p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Folha de Pagamento</p>
                    <p className="text-2xl font-bold text-teal-600">
                        R$ {funcionarios.reduce((sum, f) => sum + (f.salario || 0), 0).toFixed(2)}
                    </p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Salário Médio</p>
                    <p className="text-2xl font-bold text-purple-600">
                        R$ {funcionarios.length > 0
                            ? (funcionarios.reduce((sum, f) => sum + (f.salario || 0), 0) / funcionarios.length).toFixed(2)
                            : '0.00'}
                    </p>
                </div>
            </div>
        </div>
    );
}
