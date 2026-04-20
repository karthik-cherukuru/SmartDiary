/**
 * streakService.js — Daily writing streak logic.
 *
 * Streak rules:
 *  - If last_entry_date is yesterday  → increment current_streak
 *  - If last_entry_date is today      → no change (already written today)
 *  - If last_entry_date is older AND no active freeze → reset current_streak to 1
 *  - If last_entry_date is older AND a freeze token was activated → protect streak, decrement freeze
 *
 * Freeze tokens are stored in `freeze_tokens_remaining`.
 * Users can manually activate a freeze via the activateFreeze() function.
 *
 * Milestone streaks that trigger confetti: 7, 14, 30, 60, 100
 */
import { supabase } from '@/config/supabase'

// Streak values that trigger the confetti celebration
export const STREAK_MILESTONES = [7, 14, 30, 60, 100]

/**
 * Format a date as YYYY-MM-DD in local time.
 *
 * @param {Date} date
 * @returns {string}
 */
function toDateString(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Calculate the difference in calendar days between two date strings (YYYY-MM-DD).
 *
 * @param {string} fromDate
 * @param {string} toDate
 * @returns {number}  positive if toDate is after fromDate
 */
function daysBetween(fromDate, toDate) {
    const a = new Date(fromDate)
    const b = new Date(toDate)
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.round((b - a) / msPerDay)
}

/**
 * Fetch the streak record for a user.
 * Returns null if no record exists yet.
 *
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export async function getStreak(userId) {
    const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        console.error('[streakService] getStreak error:', error.message)
        throw new Error(error.message)
    }

    return data
}

/**
 * Update the streak after saving a journal entry.
 *
 * Returns { newStreak, isMilestone } so the caller can trigger confetti.
 *
 * @param {string} userId
 * @returns {Promise<{ newStreak: number, isMilestone: boolean }>}
 */
export async function updateStreak(userId) {
    const today    = toDateString(new Date())
    const existing = await getStreak(userId)

    let newStreak   = 1
    let newLongest  = 1

    if (!existing) {
        // First ever entry — create the streak row
        const { error: insertError } = await supabase
            .from('streaks')
            .insert({
                user_id:                userId,
                current_streak:         1,
                longest_streak:         1,
                last_entry_date:        today,
                freeze_tokens_remaining: 2,
            })

        if (insertError) {
            console.error('[streakService] insert streak error:', insertError.message)
            throw new Error(insertError.message)
        }

        console.log('[streakService] First entry — streak started at 1.')
        return { newStreak: 1, isMilestone: false }
    }

    const lastDate = existing.last_entry_date
    const diff     = daysBetween(lastDate, today)

    if (diff === 0) {
        // Already written today — no change needed
        console.log('[streakService] Already written today — streak unchanged.')
        return {
            newStreak:   existing.current_streak,
            isMilestone: false,
        }
    }

    if (diff === 1) {
        // Consecutive day — increment streak
        newStreak  = existing.current_streak + 1
        newLongest = Math.max(newStreak, existing.longest_streak)
    } else {
        // Gap in writing
        if (existing.freeze_tokens_remaining > 0) {
            // A freeze token is available — protect the streak automatically
            newStreak  = existing.current_streak
            newLongest = existing.longest_streak

            const { error: freezeError } = await supabase
                .from('streaks')
                .update({
                    freeze_tokens_remaining: existing.freeze_tokens_remaining - 1,
                    last_entry_date:         today,
                })
                .eq('user_id', userId)

            if (freezeError) throw new Error(freezeError.message)

            console.log('[streakService] Freeze token consumed — streak protected.')
            return { newStreak, isMilestone: false }
        }

        // No freeze available — reset to 1
        newStreak  = 1
        newLongest = existing.longest_streak
        console.log('[streakService] Streak broken — reset to 1.')
    }

    const { error } = await supabase
        .from('streaks')
        .update({
            current_streak:  newStreak,
            longest_streak:  newLongest,
            last_entry_date: today,
        })
        .eq('user_id', userId)

    if (error) {
        console.error('[streakService] updateStreak error:', error.message)
        throw new Error(error.message)
    }

    const isMilestone = STREAK_MILESTONES.includes(newStreak)
    console.log(`[streakService] Streak updated to ${newStreak}. Milestone: ${isMilestone}`)

    return { newStreak, isMilestone }
}

/**
 * Manually activate a freeze token.
 * Decrements the counter by 1 — shows an error if none remain.
 *
 * @param {string} userId
 * @returns {Promise<number>}  remaining tokens after activation
 */
export async function activateFreeze(userId) {
    const existing = await getStreak(userId)
    if (!existing) throw new Error('No streak record found.')

    if (existing.freeze_tokens_remaining <= 0) {
        throw new Error('No freeze tokens remaining.')
    }

    const remaining = existing.freeze_tokens_remaining - 1

    const { error } = await supabase
        .from('streaks')
        .update({ freeze_tokens_remaining: remaining })
        .eq('user_id', userId)

    if (error) {
        console.error('[streakService] activateFreeze error:', error.message)
        throw new Error(error.message)
    }

    console.log(`[streakService] Freeze activated. Remaining: ${remaining}`)
    return remaining
}
