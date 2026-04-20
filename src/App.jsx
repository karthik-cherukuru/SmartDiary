/**
 * App.jsx — root component.
 *
 * Sets up:
 *  - BrowserRouter (React Router v6)
 *  - AuthProvider + ThemeProvider context wrappers
 *  - TooltipProvider (required by shadcn Tooltip)
 *  - Sonner <Toaster /> for global toast notifications
 *  - AnimatePresence for page transitions
 *  - All routes with ProtectedRoute guards
 */
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider }  from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

import ProtectedRoute from '@/components/shared/ProtectedRoute'
import PageTransition from '@/components/shared/PageTransition'

// Pages
import Landing     from '@/pages/Landing'
import Onboarding  from '@/pages/Onboarding'
import Dashboard   from '@/pages/Dashboard'
import Journal     from '@/pages/Journal'
import JournalView from '@/pages/JournalView'
import Analytics   from '@/pages/Analytics'
import Profile     from '@/pages/Profile'
import NotFound    from '@/pages/NotFound'

/**
 * AnimatedRoutes — must be a separate component inside BrowserRouter
 * so that useLocation() is available for AnimatePresence's key prop.
 */
function AnimatedRoutes() {
    const location = useLocation()

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

                {/* Public */}
                <Route
                    path="/"
                    element={
                        <PageTransition>
                            <Landing />
                        </PageTransition>
                    }
                />

                {/* Onboarding — protected (auth required) but does NOT require onboarding_complete */}
                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute requireOnboarding={false}>
                            <PageTransition>
                                <Onboarding />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                {/* Protected pages — require auth + onboarding_complete */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <PageTransition>
                                <Dashboard />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/journal"
                    element={
                        <ProtectedRoute>
                            <PageTransition>
                                <Journal />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/journal/:id"
                    element={
                        <ProtectedRoute>
                            <PageTransition>
                                <JournalView />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <PageTransition>
                                <Analytics />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <PageTransition>
                                <Profile />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                {/* 404 fallback */}
                <Route
                    path="*"
                    element={
                        <PageTransition>
                            <NotFound />
                        </PageTransition>
                    }
                />
            </Routes>
        </AnimatePresence>
    )
}

// Root application component
export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <TooltipProvider>
                        <AnimatedRoutes />
                        {/* Global toast container — dark theme, top-center */}
                        <Toaster
                            theme="dark"
                            position="top-center"
                            richColors
                            expand={false}
                        />
                    </TooltipProvider>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
