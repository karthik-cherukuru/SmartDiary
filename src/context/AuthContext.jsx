/**
 * AuthContext — wraps the entire app.
 *
 * Responsibilities:
 *  - Subscribe to supabase.auth.onAuthStateChange to track the signed-in user.
 *  - Fetch the matching row from `profiles` when a session becomes available.
 *  - Expose signInWithGoogle() and signOut() helpers.
 *  - Provide a `loading` flag so protected routes can wait before redirecting.
 *
 * IMPORTANT (refresh / deadlock):
 *  Do NOT `await supabase.from(...)` (or any other Supabase network call) inside
 *  the onAuthStateChange callback. GoTrue holds an internal lock while that
 *  callback runs; awaiting PostgREST there deadlocks the client, so queries like
 *  getEntries() never complete after a full page reload.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'

// ----- Context object -----
const AuthContext = createContext(null)

// ----- Provider -----
export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch the profile row for a given user id
    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('[AuthContext] fetchProfile error:', error.message)
            return null
        }

        return data
    }

    // Initialize session on mount and subscribe to auth changes
    useEffect(() => {
        let mounted = true

        /**
         * Load profile AFTER the auth callback returns so GoTrue can release its lock.
         */
        const scheduleProfileLoad = (userId) => {
            queueMicrotask(() => {
                if (!mounted) return
                fetchProfile(userId)
                    .then(data => {
                        if (mounted) setProfile(data)
                    })
                    .catch(err => {
                        console.error('[AuthContext] Profile fetch error:', err)
                    })
            })
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!mounted) return

                if (session?.user) {
                    setUser(session.user)
                    scheduleProfileLoad(session.user.id)
                } else {
                    setUser(null)
                    setProfile(null)
                }

                // Always unblock the UI once GoTrue reports a state — never await DB here.
                setLoading(false)
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    // Trigger Google OAuth — Supabase redirects back to the app automatically
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        })

        if (error) {
            console.error('[AuthContext] signInWithGoogle error:', error.message)
            throw error
        }
    }

    // Sign out and clear local state
    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('[AuthContext] signOut error:', error.message)
            throw error
        }
        setUser(null)
        setProfile(null)
    }

    // Update the local profile state after onboarding or profile edits
    const refreshProfile = async () => {
        if (!user) return
        const profileData = await fetchProfile(user.id)
        setProfile(profileData)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                signInWithGoogle,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// ----- Hook -----
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an <AuthProvider>')
    }
    return context
}
