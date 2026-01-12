import { getDependentes } from '@/lib/services/dependenteService';
import ReportView from './ReportView';

export default async function RelatorioDependentesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Fetch data (limit 1000)
  const { data: dependentes } = await getDependentes({ page: 1, limit: 1000, search: '' });

  return <ReportView dependentes={dependentes} title="Relatório de Dependentes" />;
}
