/**
 * Supabase client singleton — import this everywhere DB or auth is needed.
 * Env vars are injected by Vite at build time (VITE_ prefix required).
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[Supabase] Initializing with:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnon,
    keyLength: supabaseAnon?.length ?? 0
})

if (!supabaseUrl || !supabaseAnon) {
    console.error(
        '[Supabase] Missing env vars: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY'
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
})

console.log('[Supabase] Client created successfully')

// Debug: expose to window for console testing
window.supabaseClient = supabase
