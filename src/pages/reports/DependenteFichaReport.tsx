import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReportLayout from '@/components/reports/ReportLayout';
import { getDependenteById } from '@/lib/services/dependenteService';
import { getSocioById } from '@/lib/services/socioService';
import type { ReactNode } from 'react';

export default function DependenteFichaReport() {
    const { id } = useParams();
    const dependenteId = Number(id);

    const { data: dependente, isLoading, error } = useQuery({
        queryKey: ['dependente-ficha', dependenteId],
        queryFn: () => getDependenteById(dependenteId),
        enabled: Number.isFinite(dependenteId) && dependenteId > 0,
    });

    const { data: socio } = useQuery({
        queryKey: ['socio-by-id-for-dependente', dependente?.codSocio],
        queryFn: () => getSocioById(Number(dependente?.codSocio || 0)),
        enabled: !!dependente?.codSocio && Number(dependente?.codSocio) > 0,
    });

    if (!Number.isFinite(dependenteId) || dependenteId <= 0) {
        return (
            <ReportLayout title="Ficha do Dependente" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">ID inválido.</div>
            </ReportLayout>
        );
    }

    if (isLoading) {
        return (
            <ReportLayout title="Ficha do Dependente" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Carregando...</div>
            </ReportLayout>
        );
    }

    if (error) {
        return (
            <ReportLayout title="Ficha do Dependente" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">Erro: {(error as Error).message}</div>
            </ReportLayout>
        );
    }

    if (!dependente) {
        return (
            <ReportLayout title="Ficha do Dependente" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Dependente não encontrado.</div>
            </ReportLayout>
        );
    }

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        const raw = String(value || '').trim();
        const d = new Date(raw.includes(' ') ? raw.replace(' ', 'T') : raw);
        return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR');
    };

    const yn = (v?: boolean | null) => (v ? 'SIM' : 'NÃO');

    return (
        <ReportLayout title="Ficha do Dependente" total={1} pageOrientation="portrait" singlePage showFooter={false}>
            <div className="border border-gray-300 p-3 text-[11px]">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="text-base font-bold leading-tight">{dependente.dependente || '-'}</div>
                        <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-gray-700">
                            <div className="truncate"><span className="font-bold">CÓDIGO:</span> {String(dependente.codDependente ?? '-')}</div>
                            <div className="truncate"><span className="font-bold">PARENTESCO:</span> {dependente.parentesco || '-'}</div>
                            <div className="truncate"><span className="font-bold">NASCIMENTO:</span> {formatDate(dependente.nascimento || null)}</div>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-700">
                            <span className="font-bold">SÓCIO:</span> {dependente.socio || '-'}
                        </div>
                        {(dependente.empresa || socio?.razaoSocial || socio?.nomeFantasia) ? (
                            <div className="mt-1 text-[10px] text-gray-700">
                                <span className="font-bold">EMPRESA:</span> {String(dependente.empresa || socio?.razaoSocial || socio?.nomeFantasia || '').toUpperCase()}
                            </div>
                        ) : null}
                    </div>
                    {dependente.imagem ? (
                        <div className="w-24 h-24 rounded-full border border-gray-300 overflow-hidden flex-shrink-0">
                            <img src={dependente.imagem} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                            SEM FOTO
                        </div>
                    )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <Card title="Situação">
                        <Info label="Ativo" value={yn(dependente.status)} />
                        <Info label="Carteira" value={yn(dependente.carteira)} />
                        <Info label="Órfão" value={yn(dependente.flagOrfao)} />
                    </Card>

                    <Card title="Cadastro">
                        <Info label="Data Cadastro" value={formatDate(dependente.dataCadastro || null)} />
                        <Info label="Cadastrante" value={dependente.cadastrante || '-'} />
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
