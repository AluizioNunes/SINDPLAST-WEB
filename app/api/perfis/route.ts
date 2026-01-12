import { NextResponse } from 'next/server';
import { getPerfis } from '@/lib/services/perfilService';

export async function GET() {
    try {
        const perfis = await getPerfis();
        return NextResponse.json(perfis);
    } catch (error) {
        console.error('Error in GET /api/perfis:', error);
        return NextResponse.json(
            { error: 'Failed to fetch perfis' },
            { status: 500 }
        );
    }
}
