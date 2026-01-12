import { Suspense } from 'react';
import { getCentroCustos } from '@/lib/services/centroCustoService';
import CentroCustoClientPage from './CentroCustoClientPage';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        q?: string;
    }>;
}

export default async function CentroCustosPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 50;
    const search = params.q || '';

    const { data: centroCustos, total, pages } = await getCentroCustos({ page, limit, search });

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
            </div>
        }>
            <CentroCustoClientPage 
                initialData={centroCustos} 
                total={total}
                totalPages={pages}
                currentPage={page}
            />
        </Suspense>
    );
}
