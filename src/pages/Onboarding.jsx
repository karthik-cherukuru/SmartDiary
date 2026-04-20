/**
 * Onboarding — first-time setup flow.
 *
 * Steps:
 *  1. Enter a display name
 *  2. Upload a profile photo (optional but encouraged)
 *
 * On completion: sets `onboarding_complete = true` in `profiles`
 * and redirects to /dashboard.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Button }   from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Spinner }  from '@/components/ui/spinner'

import { useAuth }   from '@/context/AuthContext'
import { supabase }  from '@/config/supabase'

// Max avatar file size: 2 MB
const MAX_FILE_SIZE = 2 * 1024 * 1024

// Step fade animation
const stepVariants = {
    enter:  { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit:   { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export default function Onboarding() {
    const { user, refreshProfile } = useAuth()
    const navigate = useNavigate()

    const [step,        setStep]        = useState(1)  // 1 = name, 2 = avatar
    const [displayName, setDisplayName] = useState('')
    const [avatarFile,  setAvatarFile]  = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [saving,      setSaving]      = useState(false)

    // ---- Step 1: validate and advance to avatar step ----
    const handleNameNext = () => {
        if (!displayName.trim()) {
            toast.error('Please enter a display name.')
            return
        }
        setStep(2)
    }

    // ---- Handle avatar file selection ----
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

        // Show local preview immediately
        const reader = new FileReader()
        reader.onload = (ev) => setAvatarPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    // ---- Step 2: upload avatar + save profile ----
    const handleFinish = async () => {
        setSaving(true)

        try {
            let avatarUrl = null

            // 1. Upload avatar if one was selected
            if (avatarFile) {
                const ext      = avatarFile.name.split('.').pop()
                const filePath = `${user.id}/avatar.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, { upsert: true })

                if (uploadError) throw new Error(uploadError.message)

                // Build the public URL
                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)

                avatarUrl = urlData.publicUrl
            }

            // 2. Upsert the profile row
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id:                  user.id,
                    display_name:        displayName.trim(),
                    avatar_url:          avatarUrl,
                    onboarding_complete: true,
                })

            if (profileError) throw new Error(profileError.message)

            // 3. Refresh local profile state in AuthContext
            await refreshProfile()

            toast.success(`Welcome, ${displayName.trim()}! Your diary is ready.`)
            navigate('/dashboard', { replace: true })

        } catch (err) {
            console.error('[Onboarding] finish error:', err.message)
            toast.error(`Something went wrong: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    const initials = displayName.trim().slice(0, 2).toUpperCase() || 'YO'

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-md">

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2].map(s => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                s === step
                                    ? 'w-8 bg-primary'
                                    : s < step
                                    ? 'w-4 bg-primary/60'
                                    : 'w-4 bg-border'
                            }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            <Card className="rounded-2xl border border-border flat-card">
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-primary font-mono-label">01</span>
                                        <span className="text-muted-foreground font-mono-label text-xs">/ 02</span>
                                    </div>
                                    <CardTitle className="font-heading text-2xl">
                                        What should we call you?
                                    </CardTitle>
                                    <CardDescription>
                                        This is the name shown in your diary. You can change it later.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="display-name">Display name</Label>
                                        <Input
                                            id="display-name"
                                            placeholder="e.g. Alex"
                                            value={displayName}
                                            onChange={e => setDisplayName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleNameNext()}
                                            autoFocus
                                        />
                                    </div>

                                    <Button
                                        className="w-full rounded-full border border-border"
                                        onClick={handleNameNext}
                                    >
                                        Continue →
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            <Card className="rounded-2xl border border-border flat-card">
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-primary font-mono-label">02</span>
                                        <span className="text-muted-foreground font-mono-label text-xs">/ 02</span>
                                    </div>
                                    <CardTitle className="font-heading text-2xl">
                                        Add a profile photo
                                    </CardTitle>
                                    <CardDescription>
                                        Optional — you can skip this and add one later.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Avatar preview */}
                                    <div className="flex flex-col items-center gap-4">
                                        <Avatar className="h-24 w-24 ring-2 ring-border">
                                            {avatarPreview && (
                                                <AvatarImage src={avatarPreview} alt="Preview" />
                                            )}
                                            <AvatarFallback className="bg-secondary text-2xl font-heading">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>

                                        <label
                                            htmlFor="avatar-upload"
                                            className="cursor-pointer text-xs text-primary hover:underline font-mono-label"
                                        >
                                            {avatarFile ? 'Change photo' : 'Upload a photo'}
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setStep(1)}
                                            disabled={saving}
                                        >
                                            ← Back
                                        </Button>

                                        <Button
                                            className="flex-1 rounded-full border border-border"
                                            onClick={handleFinish}
                                            disabled={saving}
                                        >
                                            {saving
                                                ? <Spinner className="h-4 w-4 mr-2" />
                                                : null
                                            }
                                            {saving ? 'Setting up...' : 'Start journaling'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
