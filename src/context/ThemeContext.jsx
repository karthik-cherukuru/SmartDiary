/**
 * ThemeContext — drives the emotional color system.
 *
 * Two modes:
 *  - "associative" : palette mirrors the user's current/last emotion
 *                    (applied while writing in Journal page)
 *  - "corrective"  : complementary healing palette applied on Dashboard
 *                    after an entry is saved
 *
 * ThemeContext writes CSS custom properties directly to :root so every
 * component can use var(--theme-*) without re-rendering.
 *
 * Smooth transitions are handled in index.css via `transition` on html.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { THEMES } from '@/data/themes'

// ----- Context object -----
const ThemeContext = createContext(null)

// Default state — neutral / steady emotion, associative mode
const DEFAULT_EMOTION = 'neutral'
const DEFAULT_MODE    = 'associative'

// ----- Apply palette to :root CSS variables -----
function applyPalette(palette) {
    if (!palette) return

    const root = document.documentElement

    root.style.setProperty('--theme-bg-primary',   palette['--bg-primary'])
    root.style.setProperty('--theme-bg-secondary',  palette['--bg-secondary'])
    root.style.setProperty('--theme-accent',        palette['--accent'])
    root.style.setProperty('--theme-text-primary',  palette['--text-primary'])
    root.style.setProperty('--theme-text-muted',    palette['--text-muted'])
    root.style.setProperty('--theme-border',        palette['--border'])
}

// ----- Provider -----
export function ThemeProvider({ children }) {
    const [emotion,      setEmotionState] = useState(DEFAULT_EMOTION)
    const [mode,         setModeState]    = useState(DEFAULT_MODE)
    const [currentTheme, setCurrentTheme] = useState(
        THEMES[DEFAULT_EMOTION]?.[DEFAULT_MODE] ?? null
    )

    // Main setter — called by Journal (associative) and Dashboard (corrective)
    const setEmotion = (label, themeMode = 'associative') => {
        // Normalise label — fall back to neutral if unknown
        const safeLabel = THEMES[label] ? label : 'neutral'
        const palette   = THEMES[safeLabel]?.[themeMode]

        setEmotionState(safeLabel)
        setModeState(themeMode)
        setCurrentTheme(palette ?? null)
    }

    // Whenever currentTheme changes, push CSS vars to :root
    useEffect(() => {
        applyPalette(currentTheme)
    }, [currentTheme])

    // Seed the default palette on first mount
    useEffect(() => {
        applyPalette(THEMES[DEFAULT_EMOTION]?.[DEFAULT_MODE])
    }, [])

    return (
        <ThemeContext.Provider
            value={{
                emotion,
                mode,
                currentTheme,
                setEmotion,
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

// ----- Hook -----
export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a <ThemeProvider>')
    }
    return context
}
