import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { unauthorized } from './http'

export type AuthResult =
    | { supabase: SupabaseClient; user: User }
    | { response: Response }

export async function requireAuth(): Promise<AuthResult> {
    const supabase = await createClient()

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        return { response: unauthorized() }
    }

    return { supabase, user }
}
