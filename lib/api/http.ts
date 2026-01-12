import { NextResponse } from 'next/server'

export function ok<T>(data: T) {
    return NextResponse.json(data)
}

export function created<T>(data: T) {
    return NextResponse.json(data, { status: 201 })
}

export function noContent() {
    return new NextResponse(null, { status: 204 })
}

export function badRequest(message?: string) {
    const payload: Record<string, unknown> = { error: 'bad_request' }
    if (process.env.NODE_ENV !== 'production' && message) payload.message = message
    return NextResponse.json(payload, { status: 400 })
}

export function unauthorized() {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}

export function notFound() {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
}

export function internalError(message?: string) {
    const payload: Record<string, unknown> = { error: 'internal_error' }
    if (process.env.NODE_ENV !== 'production' && message) payload.message = message
    return NextResponse.json(payload, { status: 500 })
}
