import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReportLayout from '@/components/reports/ReportLayout';
import { getFuncionarioById } from '@/lib/services/funcionarioService';
import type { ReactNode } from 'react';

export default function FuncionarioFichaReport() {
    const { id } = useParams();
    const funcionarioId = Number(id);

    const { data: funcionario, isLoading, error } = useQuery({
        queryKey: ['funcionario-ficha', funcionarioId],
        queryFn: () => getFuncionarioById(funcionarioId),
        enabled: Number.isFinite(funcionarioId) && funcionarioId > 0,
    });

    if (!Number.isFinite(funcionarioId) || funcionarioId <= 0) {
        return (
            <ReportLayout title="Ficha do Funcionário" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">ID inválido.</div>
            </ReportLayout>
        );
    }

    if (isLoading) {
        return (
            <ReportLayout title="Ficha do Funcionário" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Carregando...</div>
            </ReportLayout>
        );
    }

    if (error) {
        return (
            <ReportLayout title="Ficha do Funcionário" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">Erro: {(error as Error).message}</div>
            </ReportLayout>
        );
    }

    if (!funcionario) {
        return (
            <ReportLayout title="Ficha do Funcionário" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Funcionário não encontrado.</div>
            </ReportLayout>
        );
    }

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        const raw = String(value || '').trim();
        const d = new Date(raw.includes(' ') ? raw.replace(' ', 'T') : raw);
        return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR');
    };

    const formatMoney = (value?: number | null) => {
        if (value == null) return '-';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <ReportLayout title="Ficha do Funcionário" total={1} pageOrientation="portrait" singlePage showFooter={false}>
            <div className="border border-gray-300 p-3 text-[11px]">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="text-base font-bold leading-tight">{funcionario.nome || '-'}</div>
                        <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-gray-700">
                            <div className="truncate"><span className="font-bold">ID:</span> {String(funcionario.id || '-')}</div>
                            <div className="truncate"><span className="font-bold">CPF:</span> {funcionario.cpf || '-'}</div>
                            <div className="truncate"><span className="font-bold">ADMISSÃO:</span> {formatDate(funcionario.dataAdmissao || null)}</div>
                        </div>
                    </div>
                    {funcionario.imagem ? (
                        <div className="w-24 h-24 rounded-full border border-gray-300 overflow-hidden flex-shrink-0">
                            <img src={funcionario.imagem} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                            SEM FOTO
                        </div>
                    )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <Card title="Profissional">
                        <Info label="Cargo" value={funcionario.cargo || '-'} />
                        <Info label="CBO" value={funcionario.cbo || '-'} />
                        <Info label="Departamento" value={funcionario.depto || '-'} />
                        <Info label="Setor" value={funcionario.setor || '-'} />
                    </Card>
                    <Card title="Local / Financeiro">
                        <Info label="Empresa/Local" value={funcionario.empresaLocal || '-'} />
                        <Info label="Salário" value={formatMoney(funcionario.salario ?? null)} />
                    </Card>
                </div>
            </div>
        </ReportLayout>
    );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="border border-gray-200 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-700">{title}</div>
            <div className="mt-1 space-y-1">{children}</div>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{label}</div>
            <div className="min-w-0 flex-1 text-right font-medium truncate">{value}</div>
        </div>
    );
}

