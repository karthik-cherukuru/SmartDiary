/**
 * journalService.js — CRUD operations for the `journal_entries` table.
 *
 * RLS ensures every query is automatically scoped to the authenticated user.
 * All functions return data directly and throw on error so callers can
 * catch and show toast notifications.
 */
import { supabase } from '@/config/supabase'

/**
 * Count words in a string — used to populate the `word_count` column.
 *
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length
}

/**
 * Save a new journal entry.
 *
 * @param {string} userId
 * @param {string} content         — raw plain-text entry
 * @param {string} emotionLabel    — one of the 7 emotion labels
 * @param {number} confidence      — 0–1 confidence score from classifier
 * @returns {Promise<object>}      — the inserted row
 */
export async function saveEntry(userId, content, emotionLabel, confidence) {
    const { data, error } = await supabase
        .from('journal_entries')
        .insert({
            user_id:          userId,
            content:          content.trim(),
            emotion_label:    emotionLabel,
            confidence_score: confidence,
            word_count:       countWords(content),
        })
        .select()
        .single()

    if (error) {
        console.error('[journalService] saveEntry error:', error.message)
        throw new Error(error.message)
    }

    return data
}

/**
 * Fetch the most recent entries for the current user.
 *
 * @param {string} userId
 * @param {number} [limit=20]
 * @returns {Promise<object[]>}
 */
export async function getEntries(userId, limit = 20) {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('[journalService] getEntries error:', error.message)
        throw new Error(error.message)
    }

    return data ?? []
}

/**
 * Fetch all entries (no limit) — used for analytics charts.
 *
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export async function getAllEntries(userId) {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('[journalService] getAllEntries error:', error.message)
        throw new Error(error.message)
    }

    return data ?? []
}

/**
 * Fetch a single entry by id.
 *
 * @param {string} entryId
 * @returns {Promise<object>}
 */
export async function getEntryById(entryId) {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .single()

    if (error) {
        console.error('[journalService] getEntryById error:', error.message)
        throw new Error(error.message)
    }

    return data
}

/**
 * Delete an entry by id.
 *
 * @param {string} entryId
 * @returns {Promise<void>}
 */
export async function deleteEntry(entryId) {
    const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

    if (error) {
        console.error('[journalService] deleteEntry error:', error.message)
        throw new Error(error.message)
    }
}

/**
 * Fetch aggregate lifetime stats for the profile page.
 *
 * @param {string} userId
 * @returns {Promise<{ totalEntries: number, totalWords: number }>}
 */
export async function getLifetimeStats(userId) {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('word_count')
        .eq('user_id', userId)

    if (error) {
        console.error('[journalService] getLifetimeStats error:', error.message)
        throw new Error(error.message)
    }

    const totalEntries = data.length
    const totalWords   = data.reduce((sum, row) => sum + (row.word_count ?? 0), 0)

    return { totalEntries, totalWords }
}
