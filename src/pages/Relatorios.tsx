import { FileText } from 'lucide-react';
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
        if (reportType === 'socios') {
            const params = new URLSearchParams();
            if (status !== 'todos') params.append('status', status);
            if (dateFrom) params.append('dateFrom', dateFrom);
            if (dateTo) params.append('dateTo', dateTo);
            
            window.open(`/relatorios/print/socios?${params.toString()}`, '_blank');
            return;
        }

        if (reportType === 'empresas') {
            window.open(`/relatorios/print/empresas`, '_blank');
            return;
        }

        if (reportType === 'dependentes') {
            window.open(`/relatorios/print/dependentes`, '_blank');
            return;
        }
        
        toast.success(`Relatório de ${reportType} em desenvolvimento`);
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleGenerateReport}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <FileText className="w-5 h-5" />
                        Gerar Relatório
                    </button>
                </div>
            </div>
        </div>
    );
}
