export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
    try {
        const body = await request.json()
        return isRecord(body) ? body : null
    } catch {
        return null
    }
}

export function getString(body: Record<string, unknown>, key: string): string | undefined {
    const v = body[key]
    return typeof v === 'string' ? v : undefined
}

export function getNumber(body: Record<string, unknown>, key: string): number | undefined {
    const v = body[key]
    return typeof v === 'number' && Number.isFinite(v) ? v : undefined
}

export function getBoolean(body: Record<string, unknown>, key: string): boolean | undefined {
    const v = body[key]
    return typeof v === 'boolean' ? v : undefined
}
