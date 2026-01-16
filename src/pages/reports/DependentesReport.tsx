import { useQuery } from '@tanstack/react-query';
import { getDependentes } from '@/lib/services/dependenteService';
import ReportLayout from '@/components/reports/ReportLayout';

export default function DependentesReport() {
    const { data } = useQuery({
        queryKey: ['dependentes-report'],
        queryFn: () => getDependentes({ page: 1, limit: 1000, search: '' }),
    });

    const dependentes = data?.data || [];

    return (
        <ReportLayout title="Relatório de Dependentes" total={dependentes.length}>
            <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-gray-900">
                        <th className="border border-gray-300 p-2 text-left">Nome Dependente</th>
                        <th className="border border-gray-300 p-2 text-left">Sócio Responsável</th>
                        <th className="border border-gray-300 p-2 text-left w-32">Parentesco</th>
                        <th className="border border-gray-300 p-2 text-center w-24">Nascimento</th>
                        <th className="border border-gray-300 p-2 text-center w-20">Carteira</th>
                    </tr>
                </thead>
                <tbody>
                    {dependentes.map((dep, index) => (
                        <tr key={dep.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} break-inside-avoid`}>
                            <td className="border border-gray-300 p-2 font-medium">{dep.dependente}</td>
                            <td className="border border-gray-300 p-2">
                                <div className="flex flex-col">
                                    <span>{dep.socio}</span>
                                    {dep.empresa && <span className="text-[10px] text-gray-500">{dep.empresa}</span>}
                                </div>
                            </td>
                            <td className="border border-gray-300 p-2 text-xs uppercase">{dep.parentesco}</td>
                            <td className="border border-gray-300 p-2 text-center">
                                {dep.nascimento ? new Date(dep.nascimento).toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                                {dep.carteira ? 'Sim' : 'Não'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ReportLayout>
    );
}
