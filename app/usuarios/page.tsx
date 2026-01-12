import { getUsuarios } from '@/lib/services/usuarioService';
import UsuarioClientPage from './UsuarioClientPage';

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const search = typeof params.q === 'string' ? params.q : '';

  const { data, total, pages } = await getUsuarios({ page, limit: 10, search });

  return (
    <UsuarioClientPage
      initialData={data}
      total={total}
      totalPages={pages}
      currentPage={page}
    />
  );
}
