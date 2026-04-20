/**
 * themes.js — Emotional color palette system (light UI).
 *
 * Palettes use soft white / zinc surfaces with violet as the default brand accent.
 * No dark backgrounds: ThemeContext writes CSS vars used across the app.
 */

/**
 * Build associative + corrective pair for an emotion (flat light surfaces).
 *
 * @param {string} assocAccent  — primary accent while mirroring the emotion
 * @param {string} corrAccent   — complementary accent after save (dashboard)
 */
function lightPair(assocAccent, corrAccent) {
    const base = {
        '--bg-primary': '#f5f4f3',
        '--bg-secondary': '#ffffff',
        '--text-primary': '#0F172A',
        '--text-muted': '#64748B',
        '--border': '#c9c5c1',
    }
    return {
        associative: {
            ...base,
            '--accent': assocAccent,
        },
        corrective: {
            ...base,
            '--accent': corrAccent,
        },
    }
}

// ---- Exported map: emotion label → theme group ----
export const THEMES = {
    joy: lightPair('#DB2777', '#0891B2'),
    surprise: lightPair('#7C3AED', '#059669'),
    anger: lightPair('#DC2626', '#0D9488'),
    fear: lightPair('#2563EB', '#EA580C'),
    disgust: lightPair('#059669', '#C026D3'),
    sadness: lightPair('#6366F1', '#F97316'),
    neutral: lightPair('#6D28D9', '#4F46E5'),
}

/**
 * Helper — get a human-readable group name for an emotion label.
 */
export const EMOTION_GROUP = {
    joy: 'radiant',
    surprise: 'mellow',
    anger: 'fierce',
    fear: 'tense',
    disgust: 'sour',
    sadness: 'sour',
    neutral: 'steady',
}

/**
 * Accent color (hex) for each emotion label — charts, badges, heatmap.
 * Avoids yellow / gold per product direction; uses distinct hues.
 */
export const EMOTION_COLOR = {
    joy: '#DB2777',
    surprise: '#7C3AED',
    anger: '#DC2626',
    fear: '#2563EB',
    disgust: '#059669',
    sadness: '#6366F1',
    neutral: '#64748B',
}

/**
 * Ordered list of all valid emotion labels.
 */
export const EMOTION_LABELS = [
    'joy',
    'surprise',
    'anger',
    'fear',
    'disgust',
    'sadness',
    'neutral',
]
