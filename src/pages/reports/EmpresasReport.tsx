import { useQuery } from '@tanstack/react-query';
import { getEmpresas } from '@/lib/services/empresaService';
import ReportLayout from '@/components/reports/ReportLayout';

export default function EmpresasReport() {
    const { data } = useQuery({
        queryKey: ['empresas-report'],
        queryFn: () => getEmpresas({ page: 1, limit: 1000, search: '' }),
    });

    const empresas = data?.data || [];

    return (
        <ReportLayout title="Relatório de Empresas" total={empresas.length}>
            <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-gray-900">
                        <th className="border border-gray-300 p-2 text-left w-16">Cód.</th>
                        <th className="border border-gray-300 p-2 text-left">Razão Social</th>
                        <th className="border border-gray-300 p-2 text-left">Nome Fantasia</th>
                        <th className="border border-gray-300 p-2 text-left w-32">CNPJ</th>
                        <th className="border border-gray-300 p-2 text-left">Telefone</th>
                        <th className="border border-gray-300 p-2 text-center w-16">Func.</th>
                    </tr>
                </thead>
                <tbody>
                    {empresas.map((empresa, index) => (
                        <tr key={empresa.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} break-inside-avoid`}>
                            <td className="border border-gray-300 p-2 text-center">{empresa.codEmpresa}</td>
                            <td className="border border-gray-300 p-2 font-medium">{empresa.razaoSocial}</td>
                            <td className="border border-gray-300 p-2">{empresa.nomeFantasia || '-'}</td>
                            <td className="border border-gray-300 p-2 text-xs">{empresa.cnpj || '-'}</td>
                            <td className="border border-gray-300 p-2 text-xs">{empresa.telefone01 || empresa.celular || '-'}</td>
                            <td className="border border-gray-300 p-2 text-center">{empresa.nFuncionarios || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ReportLayout>
    );
}
