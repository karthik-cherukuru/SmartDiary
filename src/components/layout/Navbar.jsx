/**
 * Navbar — persistent top bar shown on all protected pages.
 *
 * Contains:
 *  - App logo / name (links to /dashboard)
 *  - Navigation links: Dashboard, Analytics
 *  - Streak flame badge
 *  - User avatar with dropdown (Profile, Sign Out)
 */
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

import { useAuth } from '@/context/AuthContext'
import { getStreak } from '@/services/streakService'

// Nav links visible in the top bar
const NAV_LINKS = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics', href: '/analytics' },
]

export default function Navbar() {
    const { user, profile, signOut } = useAuth()
    const navigate  = useNavigate()
    const location  = useLocation()

    const [streak, setStreak] = useState(null)

    // Fetch streak on mount to show the flame badge
    useEffect(() => {
        if (!user) return

        getStreak(user.id)
            .then(data => setStreak(data?.current_streak ?? 0))
            .catch(err => console.error('[Navbar] streak fetch:', err.message))
    }, [user])

    const handleSignOut = async () => {
        try {
            await signOut()
            navigate('/')
        } catch {
            toast.error('Could not sign out. Please try again.')
        }
    }

    // Avatar URL from profile, fallback to initials
    const avatarUrl = profile?.avatar_url ?? null
    const initials  = (profile?.display_name ?? user?.email ?? 'U')
        .slice(0, 2)
        .toUpperCase()

    const isActive = (href) => location.pathname === href

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

                {/* ---- Logo ---- */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                >
                    <span className="text-primary font-mono-label text-lg leading-none">✦</span>
                    <span className="font-heading font-semibold tracking-tight text-sm">
                        Smart Diary
                    </span>
                </Link>

                {/* ---- Nav links ---- */}
                <nav className="hidden sm:flex items-center gap-1">
                    {NAV_LINKS.map(link => (
                        <Button
                            key={link.href}
                            asChild
                            variant="ghost"
                            size="sm"
                            className={`text-xs font-mono-label ${
                                isActive(link.href)
                                    ? 'text-foreground bg-secondary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Link to={link.href}>{link.label}</Link>
                        </Button>
                    ))}
                </nav>

                {/* ---- Right side: streak + avatar ---- */}
                <div className="flex items-center gap-3">

                    {/* Streak flame badge */}
                    {streak !== null && streak > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge
                                    variant="outline"
                                    className="font-mono-label cursor-default border-amber-500/40 bg-amber-500/10 text-amber-400 text-[10px] px-2"
                                >
                                    {'▲'} {streak}d
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="text-xs">{streak}-day writing streak</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* User avatar + dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="rounded-full ring-2 ring-border hover:ring-primary transition-all focus:outline-none"
                                aria-label="Open user menu"
                            >
                                <Avatar className="h-8 w-8">
                                    {avatarUrl && (
                                        <AvatarImage
                                            src={avatarUrl}
                                            alt={profile?.display_name ?? 'User avatar'}
                                        />
                                    )}
                                    <AvatarFallback className="bg-secondary text-foreground text-xs font-mono-label">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            {/* User name header */}
                            <div className="px-2 py-1.5">
                                <p className="text-xs font-semibold text-foreground truncate">
                                    {profile?.display_name ?? 'You'}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {user?.email}
                                </p>
                            </div>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                                <Link to="/profile" className="cursor-pointer">
                                    Profile
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
