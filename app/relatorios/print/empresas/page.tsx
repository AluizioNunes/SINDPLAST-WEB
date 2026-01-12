import { getEmpresas } from '@/lib/services/empresaService';
import ReportView from './ReportView';

export default async function RelatorioEmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Fetch data (limit 1000)
  const { data: empresas } = await getEmpresas({ page: 1, limit: 1000, search: '' });

  return <ReportView empresas={empresas} title="Relatório de Empresas" />;
}
