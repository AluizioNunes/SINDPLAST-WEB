'use client';

import { FileText, Download, Filter, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function RelatoriosPage() {
    const [reportType, setReportType] = useState('socios');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [status, setStatus] = useState('todos');

    const handleGenerateReport = () => {
        toast.success('Relatório gerado! (Funcionalidade em desenvolvimento)');
    };

    const reportTypes = [
        { value: 'socios', label: 'Relatório de Sócios' },
        { value: 'empresas', label: 'Relatório de Empresas' },
        { value: 'dependentes', label: 'Relatório de Dependentes' },
        { value: 'financeiro', label: 'Relatório Financeiro' },
        { value: 'geral', label: 'Relatório Geral' },
    ];

    const statusOptions = [
        { value: 'todos', label: 'Todos' },
        { value: 'ativo', label: 'Apenas Ativos' },
        { value: 'inativo', label: 'Apenas Inativos' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Relatórios
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Gerar relatórios personalizados do sistema
                </p>
            </div>

            {/* Report Generator */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gerador de Relatórios
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="Tipo de Relatório"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        options={reportTypes}
                    />

                    <Select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        options={statusOptions}
                    />

                    <Input
                        label="Data Inicial"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />

                    <Input
                        label="Data Final"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        variant="primary"
                        icon={<Download className="w-5 h-5" />}
                        onClick={handleGenerateReport}
                    >
                        Gerar Relatório PDF
                    </Button>
                </div>
            </div>

            {/* Quick Reports */}
            <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Relatórios Rápidos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                        onClick={() => toast('Gerando relatório...', { icon: 'ℹ️' })}
                        className="p-4 text-left glass-card hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-500"
                    >
                        <FileText className="w-8 h-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Sócios Ativos
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Lista completa de sócios ativos
                        </p>
                    </button>

                    <button
                        onClick={() => toast('Gerando relatório...', { icon: 'ℹ️' })}
                        className="p-4 text-left glass-card hover:shadow-lg transition-all border-2 border-transparent hover:border-teal-500"
                    >
                        <FileText className="w-8 h-8 text-teal-600 mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Empresas Contribuintes
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Empresas com contribuição ativa
                        </p>
                    </button>

                    <button
                        onClick={() => toast('Gerando relatório...', { icon: 'ℹ️' })}
                        className="p-4 text-left glass-card hover:shadow-lg transition-all border-2 border-transparent hover:border-amber-500"
                    >
                        <FileText className="w-8 h-8 text-amber-600 mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Dependentes
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Lista de todos os dependentes
                        </p>
                    </button>

                    <button
                        onClick={() => toast('Gerando relatório...', { icon: 'ℹ️' })}
                        className="p-4 text-left glass-card hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
                    >
                        <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Mensalidades do Mês
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Relatório de mensalidades
                        </p>
                    </button>

                    <button
                        onClick={() => toast('Gerando relatório...', { icon: 'ℹ️' })}
                        className="p-4 text-left glass-card hover:shadow-lg transition-all border-2 border-transparent hover:border-red-500"
                    >
                        <Filter className="w-8 h-8 text-red-600 mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Inadimplentes
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Sócios com pendências
                        </p>
                    </button>

                    <button
                        onClick={() => toast('Gerando relatório...', { icon: 'ℹ️' })}
                        className="p-4 text-left glass-card hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500"
                    >
                        <FileText className="w-8 h-8 text-green-600 mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Relatório Geral
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Visão completa do sistema
                        </p>
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="glass-card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                    <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Sobre os Relatórios
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Os relatórios são gerados em formato PDF e incluem todos os dados filtrados conforme os parâmetros selecionados.
                            Você pode personalizar as datas, status e tipo de informação a ser exibida.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
