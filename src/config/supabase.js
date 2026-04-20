/**
 * Supabase client singleton — import this everywhere DB or auth is needed.
 * Env vars are injected by Vite at build time (VITE_ prefix required).
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
    console.error(
        '[Supabase] Missing env vars: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY'
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: {
        // Persist session in localStorage so page refreshes keep the user signed in
        persistSession: true,
        autoRefreshToken: true,
    },
})
