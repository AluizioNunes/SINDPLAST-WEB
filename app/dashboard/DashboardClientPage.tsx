'use client';

import { Users, Building2, UserCircle, Briefcase, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardStats } from '@/lib/services/dashboardService';
import EChart from '@/components/charts/EChart';

interface DashboardClientPageProps {
    stats: DashboardStats;
}

export default function DashboardClientPage({ stats }: DashboardClientPageProps) {
    const { counts, charts, financials } = stats;

    const pieOption = (title: string, data: { name: string; value: number }[]) => ({
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
                name: title,
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '20',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data
            }
        ]
    });

    const barOption = (title: string, data: { name: string; value: number }[]) => ({
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.map(d => d.name),
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: title,
                type: 'bar',
                barWidth: '60%',
                data: data.map(d => d.value),
                itemStyle: {
                    borderRadius: [4, 4, 0, 0]
                }
            }
        ]
    });

    const horizontalBarOption = (title: string, data: { name: string; value: number }[]) => ({
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: data.map(d => d.name)
        },
        series: [
            {
                name: title,
                type: 'bar',
                data: data.map(d => d.value),
                itemStyle: {
                    borderRadius: [0, 4, 4, 0]
                }
            }
        ]
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Visão geral do sistema
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border-l-4 border-purple-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Sócios</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {counts.socios}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 border-l-4 border-teal-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Empresas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {counts.empresas}
                            </p>
                        </div>
                        <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-full text-teal-600 dark:text-teal-400">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 border-l-4 border-amber-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Dependentes</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {counts.dependentes}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full text-amber-600 dark:text-amber-400">
                            <UserCircle className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 border-l-4 border-blue-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Funcionários</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {counts.funcionarios}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                            <Briefcase className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 border-l-4 border-green-500"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Mensalidades (Ativos)</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financials?.totalMensalidades || 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Socios por Sexo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Sócios por Sexo
                    </h3>
                    <EChart options={pieOption('Sócios por Sexo', charts.sociosBySexo)} />
                </motion.div>

                {/* Socios por Status */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Sócios por Status
                    </h3>
                    <EChart options={barOption('Sócios por Status', charts.sociosByStatus)} />
                </motion.div>

                {/* Dependentes por Parentesco */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Dependentes por Parentesco
                    </h3>
                    <EChart options={horizontalBarOption('Dependentes', charts.dependentesByParentesco)} />
                </motion.div>

                {/* Empresas por Status/Cidade */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Empresas (Distribuição)
                    </h3>
                    <EChart options={pieOption('Empresas', charts.empresasByStatus)} />
                </motion.div>
            </div>
        </div>
    );
}
