/**
 * ProtectedRoute — guards pages that require authentication.
 *
 * Redirect rules:
 *  1. Not authenticated           → /
 *  2. Authenticated but onboarding not complete → /onboarding
 *  3. All good                    → render children
 *
 * While the auth state is still loading, render nothing (or a spinner)
 * to prevent a flash of redirect.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * @param {object} props
 * @param {boolean} [props.requireOnboarding=true]
 *   Set to false for the /onboarding route itself — prevents redirect loop.
 */
export default function ProtectedRoute({ children, requireOnboarding = true }) {
    const { user, profile, loading } = useAuth()

    // Still fetching session — render nothing to avoid flicker
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <span className="text-muted-foreground font-mono-label animate-pulse">
                    Loading...
                </span>
            </div>
        )
    }

    // Not signed in
    if (!user) {
        return <Navigate to="/" replace />
    }

    // Signed in but onboarding incomplete (and we require onboarding)
    if (requireOnboarding && profile && !profile.onboarding_complete) {
        return <Navigate to="/onboarding" replace />
    }

    return children
}
