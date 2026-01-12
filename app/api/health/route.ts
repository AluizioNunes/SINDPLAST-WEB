import { ok } from '@/lib/api/http'

export async function GET() {
    return ok({ status: 'ok', timestamp: new Date().toISOString() })
}
