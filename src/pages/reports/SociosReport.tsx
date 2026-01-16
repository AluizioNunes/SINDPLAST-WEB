import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSocios } from '@/lib/services/socioService';
import ReportLayout from '@/components/reports/ReportLayout';

export default function SociosReport() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // In a real scenario, we would pass these filters to the service
    // For now, fetching all (limit 1000)
    const { data } = useQuery({
        queryKey: ['socios-report', status, dateFrom, dateTo],
        queryFn: () => getSocios({ page: 1, limit: 1000, search: '' }),
    });

    const socios = data?.data || [];

    // Client-side filtering if service doesn't support it fully yet
    const filteredSocios = socios.filter(socio => {
        if (status === 'ativo' && socio.status !== 'ATIVO') return false;
        if (status === 'inativo' && socio.status !== 'INATIVO') return false;
        // Date filtering would go here
        return true;
    });

    return (
        <ReportLayout title="Relatório de Sócios" total={filteredSocios.length}>
            <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-gray-900">
                        <th className="border border-gray-300 p-2 text-left w-20">Matrícula</th>
                        <th className="border border-gray-300 p-2 text-left">Nome</th>
                        <th className="border border-gray-300 p-2 text-left w-32">CPF</th>
                        <th className="border border-gray-300 p-2 text-left">Empresa</th>
                        <th className="border border-gray-300 p-2 text-left">Função</th>
                        <th className="border border-gray-300 p-2 text-center w-24">Admissão</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSocios.map((socio, index) => (
                        <tr key={socio.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} break-inside-avoid`}>
                            <td className="border border-gray-300 p-2 text-center">{socio.matricula}</td>
                            <td className="border border-gray-300 p-2 font-medium">{socio.nome}</td>
                            <td className="border border-gray-300 p-2">{socio.cpf}</td>
                            <td className="border border-gray-300 p-2 text-xs">{socio.empresa || '-'}</td>
                            <td className="border border-gray-300 p-2 text-xs">{socio.funcao || '-'}</td>
                            <td className="border border-gray-300 p-2 text-center">
                                {socio.dataAdmissao ? new Date(socio.dataAdmissao).toLocaleDateString('pt-BR') : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ReportLayout>
    );
}
