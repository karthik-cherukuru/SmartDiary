/**
 * Resolves a Supabase Storage avatar URL to a time-limited signed URL when the bucket is private.
 * Falls back to the original string if signing fails or URL is not a storage URL.
 */
import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

/**
 * @param {string|null|undefined} avatarUrl — value from profiles.avatar_url
 */
function extractAvatarsObjectPath(avatarUrl) {
    if (!avatarUrl || typeof avatarUrl !== 'string') return null
    const publicMark = '/object/public/avatars/'
    const signMark = '/object/sign/avatars/'
    let i = avatarUrl.indexOf(publicMark)
    if (i !== -1) return decodeURIComponent(avatarUrl.slice(i + publicMark.length).split('?')[0])
    i = avatarUrl.indexOf(signMark)
    if (i !== -1) return decodeURIComponent(avatarUrl.slice(i + signMark.length).split('?')[0])
    if (!avatarUrl.startsWith('http') && avatarUrl.includes('/')) return avatarUrl
    return null
}

export function useResolvedAvatarUrl(avatarUrl) {
    const [resolved, setResolved] = useState(null)

    useEffect(() => {
        let cancelled = false

        async function run() {
            if (!avatarUrl) {
                setResolved(null)
                return
            }

            const path = extractAvatarsObjectPath(avatarUrl)
            if (!path) {
                setResolved(avatarUrl)
                return
            }

            const { data, error } = await supabase.storage
                .from('avatars')
                .createSignedUrl(path, 60 * 60 * 24 * 7)

            if (cancelled) return

            if (error) {
                console.warn('[useResolvedAvatarUrl]', error.message)
                setResolved(avatarUrl)
                return
            }

            setResolved(data.signedUrl)
        }

        run()
        return () => {
            cancelled = true
        }
    }, [avatarUrl])

    return resolved
}
