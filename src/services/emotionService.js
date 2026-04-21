/**
 * emotionService.js — Calls the backend Express /classify endpoint.
 *
 * The backend runs on a local laptop and is exposed to the internet
 * via Cloudflare Tunnel. The tunnel URL is stored in VITE_EMOTION_API_URL.
 *
 * Returns: { emotion: string, confidence: number }
 */

const EMOTION_API_URL = import.meta.env.VITE_EMOTION_API_URL

/**
 * Send journal text to the local Gemma 2 2B model for classification.
 *
 * @param {string} text  — the journal entry content
 * @returns {{ emotion: string, confidence: number }}
 * @throws {Error} if the request fails or the response is malformed
 */
export async function classifyEmotion(text) {
    if (!EMOTION_API_URL) {
        throw new Error(
            'VITE_EMOTION_API_URL is not set. ' +
            'Start the backend server and set the Cloudflare Tunnel URL in .env.local'
        )
    }

    const trimmed = text?.trim()
    if (!trimmed) {
        // Nothing to classify — return neutral as a safe default
        return { emotion: 'neutral', confidence: 1.0 }
    }

    const response = await fetch(`${EMOTION_API_URL}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Emotion API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // Validate the shape before returning
    if (!data.emotion || typeof data.confidence !== 'number') {
        throw new Error('Unexpected response shape from emotion API')
    }

    console.log(`[emotionService] Classified: ${data.emotion} (${(data.confidence * 100).toFixed(1)}%)`)
    return data
}

/**
 * Classify emotion + generate associative & corrective lines (Ollama via backend).
 *
 * @param {string} text
 * @returns {Promise<{ emotion: string, confidence: number, associative_quote: string, corrective_quote: string }>}
 */
export async function analyzeJournalInsights(text) {
    if (!EMOTION_API_URL) {
        throw new Error(
            'VITE_EMOTION_API_URL is not set. ' +
                'Start the backend server and set the tunnel URL in .env.local'
        )
    }

    const trimmed = text?.trim()
    if (!trimmed) {
        return {
            emotion:           'neutral',
            confidence:        1.0,
            associative_quote: 'Showing up to write is already meaningful.',
            corrective_quote:  'Small, steady steps often beat perfect plans.',
        }
    }

    const response = await fetch(`${EMOTION_API_URL}/journal-insights`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: trimmed }),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Journal insights API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (!data.emotion || typeof data.confidence !== 'number') {
        throw new Error('Unexpected response from journal-insights')
    }

    return {
        emotion:           data.emotion,
        confidence:        data.confidence,
        associative_quote: data.associative_quote ?? '',
        corrective_quote:  data.corrective_quote ?? '',
    }
}

/**
 * Health-check the backend server.
 * Returns true if reachable, false otherwise.
 *
 * @returns {Promise<boolean>}
 */
export async function checkEmotionServerHealth() {
    if (!EMOTION_API_URL) return false

    try {
        const res = await fetch(`${EMOTION_API_URL}/health`, { method: 'GET' })
        return res.ok
    } catch {
        return false
    }
}
