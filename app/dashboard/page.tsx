'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, UserCircle, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
    socios: number;
    empresas: number;
    dependentes: number;
    usuarios: number;
}

const COLORS = ['#8B5CF6', '#14B8A6', '#F59E0B', '#EF4444'];

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        socios: 0,
        empresas: 0,
        dependentes: 0,
        usuarios: 0,
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const loadStats = useCallback(async () => {
        try {
            const [sociosRes, empresasRes, dependentesRes, usuariosRes] = await Promise.all([
                supabase.from('Socios').select('IdSocio', { count: 'exact', head: true }),
                supabase.from('Empresas').select('IdEmpresa', { count: 'exact', head: true }),
                supabase.from('Dependentes').select('IdDependente', { count: 'exact', head: true }),
                supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true }),
            ]);

            setStats({
                socios: sociosRes.count || 0,
                empresas: empresasRes.count || 0,
                dependentes: dependentesRes.count || 0,
                usuarios: usuariosRes.count || 0,
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const statCards = [
        { icon: Users, label: 'Sócios', value: stats.socios, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
        { icon: Building2, label: 'Empresas', value: stats.empresas, color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/20' },
        { icon: UserCircle, label: 'Dependentes', value: stats.dependentes, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/20' },
        { icon: Briefcase, label: 'Usuários', value: stats.usuarios, color: 'from-red-500 to-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20' },
    ];

    const chartData = [
        { name: 'Sócios', value: stats.socios },
        { name: 'Empresas', value: stats.empresas },
        { name: 'Dependentes', value: stats.dependentes },
        { name: 'Usuários', value: stats.usuarios },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Visão geral do sistema SINDPLAST-AM
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-6 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {loading ? '...' : stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-8 h-8 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Estatísticas por Categoria
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#6B7280" />
                            <YAxis stroke="#6B7280" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#14B8A6" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Distribuição
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6"
            >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Ações Rápidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium transition-all shadow-lg hover:shadow-xl">
                        Novo Sócio
                    </button>
                    <button className="p-4 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium transition-all shadow-lg hover:shadow-xl">
                        Nova Empresa
                    </button>
                    <button className="p-4 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium transition-all shadow-lg hover:shadow-xl">
                        Gerar Relatório
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
