/**
 * Navbar — flat light bar with primary navigation.
 */
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
    LayoutDashboard,
    BarChart3,
    BookOpen,
    Mail,
    Info,
    Flame,
} from 'lucide-react'

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

const NAV_LINKS = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'About',     href: '/about',     icon: Info },
    { label: 'Contact',   href: '/contact',   icon: Mail },
]

export default function Navbar() {
    const { user, profile, signOut } = useAuth()
    const navigate  = useNavigate()
    const location  = useLocation()

    const [streak, setStreak] = useState(null)

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

    const avatarUrl = profile?.avatar_url ?? null
    const initials  = (profile?.display_name ?? user?.email ?? 'U')
        .slice(0, 2)
        .toUpperCase()

    const isActive = (href) => location.pathname === href

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

                <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 text-foreground hover:text-primary transition-colors"
                >
                    <BookOpen className="h-6 w-6 text-primary shrink-0" aria-hidden />
                    <span className="font-heading font-semibold tracking-tight text-base sm:text-lg">
                        Smart Diary
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-1">
                    {NAV_LINKS.map(link => {
                        const Icon = link.icon
                        return (
                            <Button
                                key={link.href}
                                asChild
                                variant="ghost"
                                size="sm"
                                className={`text-sm font-medium gap-2 ${
                                    isActive(link.href)
                                        ? 'text-foreground bg-secondary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Link to={link.href}>
                                    <Icon className="h-4 w-4" aria-hidden />
                                    {link.label}
                                </Link>
                            </Button>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-3">

                    {streak !== null && streak > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge
                                    variant="outline"
                                    className="font-mono-label cursor-default border-primary/30 bg-primary/5 text-primary text-[11px] px-2.5 py-1 gap-1"
                                >
                                    <Flame className="h-3.5 w-3.5" aria-hidden />
                                    {streak}d
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="text-xs">{streak}-day writing streak</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div
                                className="rounded-full ring-1 ring-border hover:ring-primary transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                role="button"
                                tabIndex={0}
                                aria-label="Open user menu"
                            >
                                <Avatar className="h-9 w-9">
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
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-52">
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
                                <Link to="/profile" className="cursor-pointer text-sm">
                                    Profile
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="lg:hidden" />
                            <div className="lg:hidden py-1 space-y-0.5">
                                {NAV_LINKS.map(link => {
                                    const Icon = link.icon
                                    return (
                                        <DropdownMenuItem key={link.href} asChild>
                                            <Link to={link.href} className="cursor-pointer gap-2 flex text-sm">
                                                <Icon className="h-4 w-4" />
                                                {link.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    )
                                })}
                            </div>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="text-destructive focus:text-destructive cursor-pointer text-sm"
                            >
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
