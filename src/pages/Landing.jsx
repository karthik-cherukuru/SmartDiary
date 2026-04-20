/**
 * Landing — the public entry page.
 *
 * Full-viewport dark editorial hero with:
 *  - App name in Sora font
 *  - Tagline
 *  - Google sign-in button
 *  - Framer Motion staggered entrance animation
 *
 * Redirects to /dashboard if the user is already signed in.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

// Stagger animation variants for children
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
}

const itemVariants = {
    hidden:  { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
        },
    },
}

// Decorative feature pill items
const FEATURES = [
    { icon: '◈', label: 'Emotion detection' },
    { icon: '▲', label: 'Adaptive themes' },
    { icon: '✦', label: 'Streak tracking' },
    { icon: '◆', label: 'AI companion' },
]

export default function Landing() {
    const { user, loading, signInWithGoogle } = useAuth()
    const navigate = useNavigate()

    // Redirect already-authenticated users straight to the dashboard
    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard', { replace: true })
        }
    }, [user, loading, navigate])

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle()
            // Supabase will redirect back — no need to navigate here
        } catch {
            toast.error('Could not sign in with Google. Please try again.')
        }
    }

    // Don't flash the landing page if redirect is imminent
    if (loading || user) return null

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">

            {/* Background texture — subtle grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Amber glow spot */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
                }}
            />

            {/* Main content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex flex-col items-center gap-6 text-center max-w-lg"
            >
                {/* Brand mark */}
                <motion.div variants={itemVariants} className="flex items-center gap-2">
                    <span className="text-primary text-2xl leading-none">✦</span>
                    <span className="font-mono-label text-muted-foreground tracking-widest text-xs uppercase">
                        Smart Diary
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="font-heading text-5xl font-bold tracking-tight text-foreground leading-[1.08]"
                >
                    Your journal<br />
                    <span className="text-primary">feels you.</span>
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    variants={itemVariants}
                    className="text-muted-foreground text-base leading-relaxed max-w-sm"
                >
                    Write freely. Smart Diary detects your emotion, adapts its colors to
                    match your mood, and offers a compassionate AI companion to help you
                    process how you feel.
                </motion.p>

                {/* Feature pills */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap justify-center gap-2"
                >
                    {FEATURES.map(f => (
                        <span
                            key={f.label}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 font-mono-label text-muted-foreground"
                        >
                            <span className="text-primary text-[10px]">{f.icon}</span>
                            {f.label}
                        </span>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-3">
                    <Button
                        size="lg"
                        onClick={handleGoogleSignIn}
                        className="shadow-brutal font-semibold px-8 gap-3 h-12 text-sm"
                    >
                        {/* Google SVG icon */}
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                            <path
                                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                                fill="#4285F4"
                            />
                            <path
                                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                                fill="#34A853"
                            />
                            <path
                                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    <p className="text-[11px] text-muted-foreground">
                        Your entries are private. Only you can access them.
                    </p>
                </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
                className="absolute bottom-6 text-[11px] text-muted-foreground font-mono-label"
            >
                Smart Diary — Emotionally intelligent journaling
            </motion.footer>
        </div>
    )
}
