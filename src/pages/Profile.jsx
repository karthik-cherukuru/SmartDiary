/**
 * Profile — user account management page.
 *
 * Sections:
 *  1. Avatar upload + display name edit
 *  2. Lifetime stats (total entries, total words, longest streak)
 *  3. Danger zone — account deletion with AlertDialog confirmation
 *
 * All mutations go through Supabase directly and show toast feedback.
 */
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { toast }               from 'sonner'

import Navbar from '@/components/layout/Navbar'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input }     from '@/components/ui/input'
import { Label }     from '@/components/ui/label'
import { Button }    from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton }  from '@/components/ui/skeleton'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'

import { useAuth }   from '@/context/AuthContext'
import { supabase }  from '@/config/supabase'
import { getLifetimeStats } from '@/services/journalService'
import { getStreak }        from '@/services/streakService'

const MAX_FILE_SIZE = 2 * 1024 * 1024

export default function Profile() {
    const { user, profile, refreshProfile, signOut } = useAuth()
    const navigate = useNavigate()

    // Lazy initialization — profile may not be loaded yet on first render
    const [displayName,   setDisplayName]   = useState(() => profile?.display_name ?? '')
    const [avatarPreview, setAvatarPreview] = useState(() => profile?.avatar_url   ?? null)
    const [avatarFile,    setAvatarFile]    = useState(null)
    const [savingProfile, setSavingProfile] = useState(false)

    const [stats, setStats] = useState(null)

    // Load stats on mount
    useEffect(() => {
        if (!user) return

        Promise.all([
            getLifetimeStats(user.id),
            getStreak(user.id),
        ])
            .then(([journalStats, streakData]) => {
                setStats({
                    totalEntries: journalStats.totalEntries,
                    totalWords:   journalStats.totalWords,
                    longestStreak: streakData?.longest_streak ?? 0,
                })
            })
            .catch(err => console.error('[Profile] stats error:', err.message))
    }, [user])

    // When the profile row loads asynchronously, sync local edit state once
    useEffect(() => {
        if (profile?.display_name) setDisplayName(profile.display_name)
        if (profile?.avatar_url)   setAvatarPreview(profile.avatar_url)
    }, [profile])

    // ---- Handle file selection ----
    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.')
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('Image must be smaller than 2 MB.')
            return
        }

        setAvatarFile(file)
        const reader = new FileReader()
        reader.onload = ev => setAvatarPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    // ---- Save profile changes ----
    const handleSaveProfile = async () => {
        if (!displayName.trim()) {
            toast.error('Display name cannot be empty.')
            return
        }

        setSavingProfile(true)
        try {
            let avatarUrl = profile?.avatar_url ?? null

            // Upload new avatar if one was chosen
            if (avatarFile) {
                const ext      = avatarFile.name.split('.').pop()
                const filePath = `${user.id}/avatar.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true })

                if (uploadError) throw new Error(uploadError.message)

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)

                avatarUrl = urlData.publicUrl
            }

            // Update profile row
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName.trim(),
                    avatar_url:   avatarUrl,
                })
                .eq('id', user.id)

            if (error) throw new Error(error.message)

            await refreshProfile()
            toast.success('Profile updated.')

        } catch (err) {
            console.error('[Profile] saveProfile error:', err.message)
            toast.error(`Could not save: ${err.message}`)
        } finally {
            setSavingProfile(false)
        }
    }

    // ---- Delete account ----
    const handleDeleteAccount = async () => {
        try {
            // Delete all user data — RLS cascades but we call explicitly for safety
            await Promise.all([
                supabase.from('journal_entries').delete().eq('user_id', user.id),
                supabase.from('chat_messages').delete().eq('user_id', user.id),
                supabase.from('streaks').delete().eq('user_id', user.id),
            ])

            // Delete profile
            await supabase.from('profiles').delete().eq('id', user.id)

            // Sign out
            await signOut()
            navigate('/')
            toast.success('Your account has been deleted.')

        } catch (err) {
            console.error('[Profile] deleteAccount error:', err.message)
            toast.error(`Could not delete account: ${err.message}`)
        }
    }

    const initials = (profile?.display_name ?? 'YO').slice(0, 2).toUpperCase()

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
                <header className="mb-2">
                    <h1 className="font-heading text-2xl font-bold">Profile</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your account details and data.
                    </p>
                </header>

                {/* ---- Identity card ---- */}
                <Card className="shadow-brutal-muted">
                    <CardHeader>
                        <CardTitle className="font-heading text-base">Identity</CardTitle>
                        <CardDescription className="text-xs">
                            Your display name and avatar shown in the app.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 ring-2 ring-border">
                                {avatarPreview && (
                                    <AvatarImage src={avatarPreview} alt={displayName} />
                                )}
                                <AvatarFallback className="bg-secondary font-heading text-xl">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <label
                                    htmlFor="avatar-upload-profile"
                                    className="cursor-pointer text-xs text-primary hover:underline font-mono-label block mb-1"
                                >
                                    {avatarFile ? 'Change photo' : 'Upload new photo'}
                                </label>
                                <p className="text-[10px] text-muted-foreground font-mono-label">
                                    Max 2 MB — JPG, PNG, WebP
                                </p>
                                <input
                                    id="avatar-upload-profile"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Display name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="display-name-profile">Display name</Label>
                            <Input
                                id="display-name-profile"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <Button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="shadow-brutal"
                        >
                            {savingProfile
                                ? <><Spinner className="h-4 w-4 mr-2" /> Saving…</>
                                : 'Save changes'
                            }
                        </Button>
                    </CardContent>
                </Card>

                {/* ---- Lifetime stats ---- */}
                <Card className="shadow-brutal-muted">
                    <CardHeader>
                        <CardTitle className="font-heading text-base">Lifetime stats</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {!stats ? (
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Total entries', value: stats.totalEntries },
                                    { label: 'Total words',   value: stats.totalWords.toLocaleString() },
                                    { label: 'Longest streak', value: `${stats.longestStreak}d` },
                                ].map(stat => (
                                    <div
                                        key={stat.label}
                                        className="rounded-lg border border-border bg-secondary p-4 text-center"
                                    >
                                        <p className="font-heading text-2xl font-bold">{stat.value}</p>
                                        <p className="font-mono-label text-[10px] text-muted-foreground mt-1">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ---- Danger zone ---- */}
                <Card className="border-destructive/30 shadow-brutal-muted">
                    <CardHeader>
                        <CardTitle className="font-heading text-base text-destructive">
                            Danger zone
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Deleting your account is permanent and cannot be undone.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Separator className="mb-4" />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete my account
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-heading">
                                        Delete your account?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        All your journal entries, chat history, and streak data
                                        will be permanently deleted. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Yes, delete everything
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
