import { getSocios } from '@/lib/services/socioService';
import ReportView from './ReportView';

export default async function RelatorioSociosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = typeof params.status === 'string' ? params.status : undefined;
  
  // Fetch data (limit 1000 for safety, in real app might need pagination or streaming)
  const { data: socios } = await getSocios({ page: 1, limit: 1000, search: '' });

  // Optional: Apply filters on server side if not handled by service
  // (Service handles search, but not complex filters yet)
  const filteredSocios = socios; 

  return <ReportView socios={filteredSocios} title="Relatório de Sócios" />;
}
