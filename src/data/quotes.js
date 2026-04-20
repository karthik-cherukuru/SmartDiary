/**
 * quotes.js — Writing prompts and reflective quotes, keyed by emotion label.
 *
 * Shown on the Journal page as a subtle nudge before the user starts writing.
 * Each emotion has several options so the UI can cycle through them.
 */

export const QUOTES = {
    joy: [
        "Something lit you up today — write it down before it fades.",
        "Joy is worth recording in full. What made today feel alive?",
        "Let the good things take up more space on the page.",
        "What small thing today made you smile without expecting to?",
    ],

    surprise: [
        "Something caught you off guard. What was it?",
        "The unexpected has a way of teaching us what we didn't know we needed.",
        "What did today reveal that you weren't prepared for?",
        "Surprise is the universe's way of showing us we don't have all the answers.",
    ],

    anger: [
        "Anger is information. What is it telling you right now?",
        "Write without filtering — this space is yours alone.",
        "What boundary was crossed today, and what would you want to say about it?",
        "Let the frustration land on the page. It can't hurt you there.",
    ],

    fear: [
        "Fear is just a story we tell ourselves. What story are you telling?",
        "Write about what's worrying you — naming it shrinks it.",
        "What would you do today if you weren't afraid?",
        "You've survived every hard thing so far. What's this one asking of you?",
    ],

    disgust: [
        "Something didn't sit right today. What was it, and why does it matter to you?",
        "Our strongest reactions reveal our deepest values. What value did you feel violated?",
        "Write about what repelled you — sometimes clarity comes from discomfort.",
        "What would it look like if this situation were different?",
    ],

    sadness: [
        "Grief and sadness deserve a place on the page too. You're allowed to feel this.",
        "What are you missing or mourning today?",
        "Sadness is a love letter to the things that matter. What matters to you?",
        "Write to the part of you that's hurting. What does it need to hear?",
    ],

    neutral: [
        "No big feelings today — that's perfectly okay. What was ordinary and beautiful?",
        "A quiet day is still a day worth recording.",
        "What did you notice today that you usually walk past?",
        "Write about whatever is on your mind, however small.",
    ],
}

/**
 * Get a random quote for a given emotion label.
 * Falls back to a neutral quote if the label is unknown.
 */
export function getRandomQuote(emotion) {
    const pool = QUOTES[emotion] ?? QUOTES.neutral
    return pool[Math.floor(Math.random() * pool.length)]
}
