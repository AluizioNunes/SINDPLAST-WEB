import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReportLayout from '@/components/reports/ReportLayout';
import { getSocioById } from '@/lib/services/socioService';

export default function SocioFichaReport() {
    const { id } = useParams();
    const socioId = Number(id);

    const { data: socio, isLoading, error } = useQuery({
        queryKey: ['socio-ficha', socioId],
        queryFn: () => getSocioById(socioId),
        enabled: Number.isFinite(socioId) && socioId > 0,
    });

    if (!Number.isFinite(socioId) || socioId <= 0) {
        return (
            <ReportLayout title="Ficha do Sócio" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">ID inválido.</div>
            </ReportLayout>
        );
    }

    if (isLoading) {
        return (
            <ReportLayout title="Ficha do Sócio" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Carregando...</div>
            </ReportLayout>
        );
    }

    if (error) {
        return (
            <ReportLayout title="Ficha do Sócio" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-red-600">Erro: {(error as Error).message}</div>
            </ReportLayout>
        );
    }

    if (!socio) {
        return (
            <ReportLayout title="Ficha do Sócio" total={0} pageOrientation="portrait" singlePage showFooter={false}>
                <div className="text-sm text-gray-600">Sócio não encontrado.</div>
            </ReportLayout>
        );
    }

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR');
    };

    return (
        <ReportLayout title="Ficha do Sócio" total={1} pageOrientation="portrait" singlePage showFooter={false}>
            <div className="border border-gray-300 p-4">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="text-lg font-bold">{socio.nome || '-'}</div>
                        <div className="text-xs text-gray-600">Matrícula: {socio.matricula || '-'}</div>
                        <div className="text-xs text-gray-600">Status: {socio.status || '-'}</div>
                    </div>
                    {socio.imagem ? (
                        <div className="w-28 h-28 border border-gray-300 overflow-hidden">
                            <img src={socio.imagem} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-28 h-28 border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                            Sem foto
                        </div>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Info label="CPF" value={socio.cpf || '-'} />
                    <Info label="RG" value={socio.rg || '-'} />
                    <Info label="Nascimento" value={formatDate(socio.nascimento)} />
                    <Info label="Admissão" value={formatDate(socio.dataAdmissao)} />
                    <Info label="Empresa" value={socio.empresa || socio.razaoSocial || '-'} />
                    <Info label="Função" value={socio.funcao || '-'} />
                    <Info label="Celular" value={socio.celular || '-'} />
                    <Info label="Email" value={socio.email || socio.redeSocial || '-'} />
                </div>
            </div>
        </ReportLayout>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="border border-gray-200 p-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</div>
            <div className="font-medium">{value}</div>
        </div>
    );
}
