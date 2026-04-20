/**
 * themes.js — Emotional color palette system.
 *
 * 7 emotion labels map to 5 theme groups:
 *   joy       → radiant
 *   surprise  → mellow
 *   anger     → fierce
 *   fear      → tense
 *   disgust   → sour
 *   sadness   → sour  (shares the sour group with disgust)
 *   neutral   → steady
 *
 * Each group has two palette variants:
 *   associative  — mirrors the emotion's color psychology (used while writing)
 *   corrective   — therapeutic complement that soothes or balances (used on dashboard post-save)
 *
 * CSS variables applied to :root by ThemeContext:
 *   --theme-bg-primary    main background color
 *   --theme-bg-secondary  card/panel background
 *   --theme-accent        highlight / CTA color
 *   --theme-text-primary  primary body text
 *   --theme-text-muted    secondary / placeholder text
 *   --theme-border        border color
 */

// ---- Radiant (joy) ----------------------------------------
const radiant = {
    associative: {
        '--bg-primary':   '#0D0A00',
        '--bg-secondary': '#1A1400',
        '--accent':       '#F59E0B',
        '--text-primary': '#FFF7E6',
        '--text-muted':   '#A38C5A',
        '--border':       '#2E2600',
    },
    corrective: {
        // Corrective for joy: cool sky blues to ground and centre
        '--bg-primary':   '#00090D',
        '--bg-secondary': '#001520',
        '--accent':       '#38BDF8',
        '--text-primary': '#E0F4FF',
        '--text-muted':   '#5A8EA3',
        '--border':       '#002233',
    },
}

// ---- Mellow (surprise) ------------------------------------
const mellow = {
    associative: {
        // Surprise: curious violet-lavender
        '--bg-primary':   '#09000D',
        '--bg-secondary': '#130019',
        '--accent':       '#A78BFA',
        '--text-primary': '#F0E8FF',
        '--text-muted':   '#7B5FA3',
        '--border':       '#200033',
    },
    corrective: {
        // Corrective for surprise: warm sage green — grounding
        '--bg-primary':   '#00090A',
        '--bg-secondary': '#001510',
        '--accent':       '#34D399',
        '--text-primary': '#E0FFF6',
        '--text-muted':   '#5AA38A',
        '--border':       '#002A1E',
    },
}

// ---- Fierce (anger) ---------------------------------------
const fierce = {
    associative: {
        // Anger: deep crimson-red — visceral, intense
        '--bg-primary':   '#0D0000',
        '--bg-secondary': '#1A0000',
        '--accent':       '#F87171',
        '--text-primary': '#FFE8E8',
        '--text-muted':   '#A35A5A',
        '--border':       '#330000',
    },
    corrective: {
        // Corrective for anger: cool mint-teal — calming, defusing
        '--bg-primary':   '#000D0A',
        '--bg-secondary': '#001A14',
        '--accent':       '#2DD4BF',
        '--text-primary': '#E0FFF9',
        '--text-muted':   '#5AA39A',
        '--border':       '#003326',
    },
}

// ---- Tense (fear) -----------------------------------------
const tense = {
    associative: {
        // Fear: cold blue-grey — isolated, shadowy
        '--bg-primary':   '#000509',
        '--bg-secondary': '#000D18',
        '--accent':       '#93C5FD',
        '--text-primary': '#E8F0FF',
        '--text-muted':   '#5A6A8A',
        '--border':       '#001026',
    },
    corrective: {
        // Corrective for fear: warm honey-amber — safety, courage
        '--bg-primary':   '#0D0800',
        '--bg-secondary': '#1A1200',
        '--accent':       '#FBBF24',
        '--text-primary': '#FFF6D6',
        '--text-muted':   '#A38730',
        '--border':       '#2E1F00',
    },
}

// ---- Sour (disgust + sadness) -----------------------------
const sour = {
    associative: {
        // Disgust/Sadness: muted olive-green — heavy, withdrawn
        '--bg-primary':   '#050900',
        '--bg-secondary': '#0B1200',
        '--accent':       '#86EFAC',
        '--text-primary': '#EBF5E0',
        '--text-muted':   '#6A8A5A',
        '--border':       '#152000',
    },
    corrective: {
        // Corrective for sadness: warm peach — uplift, tenderness
        '--bg-primary':   '#0D0600',
        '--bg-secondary': '#1A0D00',
        '--accent':       '#FB923C',
        '--text-primary': '#FFF0E6',
        '--text-muted':   '#A36040',
        '--border':       '#2E1200',
    },
}

// ---- Steady (neutral) -------------------------------------
const steady = {
    associative: {
        // Neutral: balanced grey-zinc — clean, present
        '--bg-primary':   '#0A0A0A',
        '--bg-secondary': '#111111',
        '--accent':       '#F59E0B',
        '--text-primary': '#E8E8E8',
        '--text-muted':   '#666666',
        '--border':       '#222222',
    },
    corrective: {
        // Corrective for neutral: soft indigo — contemplative, open
        '--bg-primary':   '#04040D',
        '--bg-secondary': '#08081A',
        '--accent':       '#818CF8',
        '--text-primary': '#EAE8FF',
        '--text-muted':   '#606080',
        '--border':       '#12122A',
    },
}

// ---- Exported map: emotion label → theme group ----
export const THEMES = {
    joy:      radiant,
    surprise: mellow,
    anger:    fierce,
    fear:     tense,
    disgust:  sour,
    sadness:  sour,
    neutral:  steady,
}

/**
 * Helper — get a human-readable group name for an emotion label.
 */
export const EMOTION_GROUP = {
    joy:      'radiant',
    surprise: 'mellow',
    anger:    'fierce',
    fear:     'tense',
    disgust:  'sour',
    sadness:  'sour',
    neutral:  'steady',
}

/**
 * Helper — accent color (hex) for each emotion label.
 * Used for chart colors, badge borders, etc.
 */
export const EMOTION_COLOR = {
    joy:      '#F59E0B',
    surprise: '#A78BFA',
    anger:    '#F87171',
    fear:     '#93C5FD',
    disgust:  '#86EFAC',
    sadness:  '#FB923C',
    neutral:  '#9CA3AF',
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
