import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReportLayout from '@/components/reports/ReportLayout';
import { getEmpresaById } from '@/lib/services/empresaService';
import type { ReactNode } from 'react';

export default function EmpresaFichaReport() {
    const { id } = useParams();
    const empresaId = Number(id);

    const { data: empresa, isLoading, error } = useQuery({
        queryKey: ['empresa-ficha', empresaId],
        queryFn: () => getEmpresaById(empresaId),
        enabled: Number.isFinite(empresaId) && empresaId > 0,
    });

    if (!Number.isFinite(empresaId) || empresaId <= 0) {
        return (
            <ReportLayout title="Ficha da Empresa" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">ID inválido.</div>
            </ReportLayout>
        );
    }

    if (isLoading) {
        return (
            <ReportLayout title="Ficha da Empresa" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Carregando...</div>
            </ReportLayout>
        );
    }

    if (error) {
        return (
            <ReportLayout title="Ficha da Empresa" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">Erro: {(error as Error).message}</div>
            </ReportLayout>
        );
    }

    if (!empresa) {
        return (
            <ReportLayout title="Ficha da Empresa" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Empresa não encontrada.</div>
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
        <ReportLayout title="Ficha da Empresa" total={1} pageOrientation="portrait" singlePage showFooter={false}>
            <div className="border border-gray-300 p-3 text-[11px]">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="text-base font-bold leading-tight">{empresa.nomeFantasia || empresa.razaoSocial || '-'}</div>
                        <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-gray-700">
                            <div className="truncate"><span className="font-bold">CÓDIGO:</span> {empresa.codEmpresa || '-'}</div>
                            <div className="truncate"><span className="font-bold">CNPJ:</span> {empresa.cnpj || '-'}</div>
                            <div className="truncate"><span className="font-bold">CADASTRO:</span> {formatDate(empresa.dataCadastro || null)}</div>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-700">
                            <span className="font-bold">CADASTRANTE:</span> {empresa.cadastrante || '-'}
                        </div>
                    </div>
                    {empresa.imagem ? (
                        <div className="w-24 h-24 rounded-full border border-gray-300 overflow-hidden flex-shrink-0">
                            <img src={empresa.imagem} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-500 flex-shrink-0">
                            SEM FOTO
                        </div>
                    )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <Card title="Empresa">
                        <Info label="Razão Social" value={empresa.razaoSocial || '-'} />
                        <Info label="Nome Fantasia" value={empresa.nomeFantasia || '-'} />
                        <Info label="Nº Funcionários" value={String(empresa.nFuncionarios ?? '-')} />
                    </Card>

                    <Card title="Contribuição">
                        <Info label="Data Contribuição" value={formatDate(empresa.dataContribuicao || null)} />
                        <Info label="Valor Contribuição" value={formatMoney(empresa.valorContribuicao ?? null)} />
                    </Card>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                    <Card title="Endereço">
                        <Info label="Endereço" value={[empresa.endereco, empresa.numero].filter(Boolean).join(', ') || '-'} />
                        <Info label="Complemento" value={empresa.complemento || '-'} />
                        <Info label="Bairro" value={empresa.bairro || '-'} />
                        <Info label="CEP" value={empresa.cep || '-'} />
                        <Info label="Cidade/UF" value={[empresa.cidade, empresa.uf].filter(Boolean).join(' / ') || '-'} />
                    </Card>

                    <Card title="Contato">
                        <Info label="Telefone 1" value={empresa.telefone01 || '-'} />
                        <Info label="Telefone 2" value={empresa.telefone02 || '-'} />
                        <Info label="Celular" value={empresa.celular || '-'} />
                        <Info label="WhatsApp" value={empresa.whatsapp || '-'} />
                        <Info label="Instagram" value={empresa.instagram || '-'} />
                        <Info label="LinkedIn" value={empresa.linkedin || '-'} />
                    </Card>
                </div>

                <div className="mt-2">
                    <Card title="Observação">
                        <div className="text-[11px] whitespace-pre-wrap break-words">{empresa.observacao || '-'}</div>
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

