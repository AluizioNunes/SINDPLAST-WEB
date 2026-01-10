'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, UserCircle, Briefcase, FilterX } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Stats {
    socios: any[];
    empresas: any[];
    dependentes: any[];
    usuarios: number;
}

interface Filter {
    type: 'sexo' | 'status' | 'empresa' | 'parentesco' | null;
    value: string | null;
}

const COLORS = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function DashboardPage() {
    const [data, setData] = useState<Stats>({
        socios: [],
        empresas: [],
        dependentes: [],
        usuarios: 0,
    });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<Filter>({ type: null, value: null });

    const supabase = createClient();

    const loadData = useCallback(async () => {
        try {
            const [sociosRes, empresasRes, dependentesRes, usuariosRes] = await Promise.all([
                supabase.from('Socios').select('IdSocio, sexo, status, razaoSocial'),
                supabase.from('Empresas').select('IdEmpresa, razaoSocial'),
                supabase.from('Dependentes').select('IdDependente, parentesco, status'),
                supabase.from('Usuarios').select('IdUsuarios', { count: 'exact', head: true }),
            ]);

            setData({
                socios: sociosRes.data || [],
                empresas: empresasRes.data || [],
                dependentes: dependentesRes.data || [],
                usuarios: usuariosRes.count || 0,
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter Logic
    const filteredData = useMemo(() => {
        if (!activeFilter.type || !activeFilter.value) {
            return data;
        }

        const { type, value } = activeFilter;

        // When a filter is active, we filter the relevant lists
        // Note: For simplicity and to show "relationships", when we filter by 'sexo', 
        // it mainly affects the Socios count and we show how many are in each status/company for that gender.

        return {
            ...data,
            socios: data.socios.filter(s => {
                if (type === 'sexo') return s.sexo === value;
                if (type === 'status') return s.status === value;
                if (type === 'empresa') return s.razaoSocial === value;
                return true;
            }),
            // Dependentes don't have 'sexo' in this schema view, but they have status and parentesco
            dependentes: data.dependentes.filter(d => {
                if (type === 'status') return d.status === (value === 'Ativo'); // assuming mapping
                return true;
            })
        };
    }, [data, activeFilter]);

    // Chart Data Preparation
    const genderData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.socios.forEach(s => {
            const g = s.sexo || 'Não informado';
            counts[g] = (counts[g] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [data.socios]);

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredData.socios.forEach(s => {
            const st = s.status || 'Não informado';
            counts[st] = (counts[st] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredData.socios]);

    const topCompaniesData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredData.socios.forEach(s => {
            const emp = s.razaoSocial || 'Sem Empresa';
            counts[emp] = (counts[emp] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredData.socios]);

    const clearFilter = () => setActiveFilter({ type: null, value: null });

    const toggleFilter = (type: Filter['type'], value: string) => {
        if (activeFilter.type === type && activeFilter.value === value) {
            clearFilter();
        } else {
            setActiveFilter({ type, value });
        }
    };

    const statCards = [
        {
            icon: Users,
            label: 'Sócios',
            value: filteredData.socios.length,
            color: 'from-blue-500 to-indigo-600',
            textColor: 'text-white'
        },
        {
            icon: Building2,
            label: 'Empresas',
            value: data.empresas.length,
            color: 'from-emerald-400 to-teal-500',
            textColor: 'text-white'
        },
        {
            icon: UserCircle,
            label: 'Dependentes',
            value: filteredData.dependentes.length,
            color: 'from-amber-400 to-orange-500',
            textColor: 'text-white'
        },
        {
            icon: Briefcase,
            label: 'Usuários',
            value: data.usuarios,
            color: 'from-rose-500 to-red-600',
            textColor: 'text-white'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tighter">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Inteligência de Dados SINDPLAST-AM
                    </p>
                </div>

                <AnimatePresence>
                    {activeFilter.type && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={clearFilter}
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-red-100 dark:border-red-800 shadow-sm hover:shadow transition-all"
                        >
                            <FilterX className="w-4 h-4" />
                            Limpar Filtro: <span className="uppercase">{activeFilter.value}</span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Stats Cards - Now MORE COLORFUL */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className={`relative overflow-hidden p-6 rounded-3xl shadow-xl bg-gradient-to-br ${stat.color} ${stat.textColor} group cursor-default`}
                        >
                            <div className="relative z-10">
                                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">
                                    {stat.label}
                                </p>
                                <p className="text-4xl font-black">
                                    {loading ? '...' : stat.value.toLocaleString()}
                                </p>
                            </div>
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 group-hover:opacity-30 transition-opacity">
                                <Icon className="w-20 h-20" />
                            </div>
                            {/* Suble pattern overlay */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gender Pie Chart - The Filter Trigger */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 lg:col-span-1"
                >
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-2 h-6 bg-red-600 rounded-full" />
                        Distribuição por Sexo
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={genderData}
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                onClick={(data: any) => toggleFilter('sexo', data.name)}
                            >
                                {genderData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        cursor="pointer"
                                        style={{
                                            filter: activeFilter.type === 'sexo' && activeFilter.value !== entry.name
                                                ? 'grayscale(0.8) opacity(0.5)'
                                                : activeFilter.value === entry.name ? 'drop-shadow(0 0 8px rgba(0,0,0,0.2))' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        strokeWidth={activeFilter.value === entry.name ? 4 : 1}
                                        stroke={activeFilter.value === entry.name ? '#fff' : 'none'}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-center text-gray-400 uppercase font-black mt-2">Clique para filtrar</p>
                </motion.div>

                {/* Status Bar Chart - Reactive */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6 lg:col-span-1"
                >
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-2 h-6 bg-blue-600 rounded-full" />
                        Status dos Sócios
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData} onClick={(data: any) => data && toggleFilter('status', data.activeLabel)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} fontSize={10} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[10, 10, 0, 0]}
                                barSize={40}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={activeFilter.value === entry.name ? '#2563eb' : '#60a5fa'}
                                        cursor="pointer"
                                        style={{ transition: 'all 0.3s ease' }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Companies Chart - Reactive */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6 lg:col-span-1"
                >
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                        <div className="w-2 h-6 bg-emerald-600 rounded-full" />
                        Top 5 Empresas
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCompaniesData} layout="vertical" margin={{ left: 20 }} onClick={(data: any) => data && toggleFilter('empresa', data.activeLabel)}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" fontSize={9} width={80} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#10b981"
                                radius={[0, 10, 10, 0]}
                                barSize={20}
                            >
                                {topCompaniesData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={activeFilter.value === entry.name ? '#059669' : '#34d399'}
                                        cursor="pointer"
                                        style={{ transition: 'all 0.3s ease' }}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="glass-card p-8 border-t-4 border-red-600"
            >
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">
                    Ações de Gestão
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-red-600 hover:text-white transition-all group border border-gray-100 dark:border-gray-700">
                        <Users className="w-6 h-6 mb-1 text-red-600 group-hover:text-white" />
                        <span className="text-sm font-black uppercase">Novo Sócio</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-emerald-600 hover:text-white transition-all group border border-gray-100 dark:border-gray-700">
                        <Building2 className="w-6 h-6 mb-1 text-emerald-600 group-hover:text-white" />
                        <span className="text-sm font-black uppercase">Nova Empresa</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition-all group border border-gray-100 dark:border-gray-700">
                        <UserCircle className="w-6 h-6 mb-1 text-blue-600 group-hover:text-white" />
                        <span className="text-sm font-black uppercase">Dependentes</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-amber-500 hover:text-white transition-all group border border-gray-100 dark:border-gray-700">
                        <Briefcase className="w-6 h-6 mb-1 text-amber-500 group-hover:text-white" />
                        <span className="text-sm font-black uppercase">Relatórios</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
