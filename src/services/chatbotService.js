/**
 * chatbotService.js — Groq chatbot via Supabase Edge Function proxy.
 *
 * The Groq API key is stored server-side as a Supabase secret.
 * The frontend never touches the key directly — it calls the `chat-proxy`
 * Edge Function which forwards the request to Groq.
 *
 * Conversation messages in `chat_messages` table are keyed by entry_id
 * so users can review the chat history alongside each journal entry.
 */
import { supabase } from '@/config/supabase'

/**
 * Build the compassionate system prompt for the chatbot.
 * Bakes in the journal entry content as context.
 *
 * @param {string} entryContent  — the journal entry text
 * @param {string} emotion       — detected emotion label
 * @returns {string}
 */
export function buildSystemPrompt(entryContent, emotion) {
    return [
        'You are a warm, compassionate journaling companion called Sage.',
        'Your role is to help the user process their feelings through gentle, thoughtful questions and reflective responses.',
        'You do NOT give advice or diagnoses. You are NOT a therapist.',
        'Speak calmly, warmly, and without judgment. Keep responses concise — 2–4 sentences.',
        '',
        `The user just wrote this journal entry (detected emotion: ${emotion}):`,
        '---',
        entryContent,
        '---',
        '',
        'Respond with empathy. Ask one thoughtful follow-up question to help them explore further.',
    ].join('\n')
}

/**
 * Send a message to the chatbot via the Supabase chat-proxy Edge Function.
 *
 * @param {Array<{role: string, content: string}>} messages  — conversation history
 * @returns {Promise<string>}  — the assistant's reply text
 */
export async function sendMessage(messages) {
    const { data, error } = await supabase.functions.invoke('chat-proxy', {
        body: { messages },
    })

    if (error) {
        console.error('[chatbotService] sendMessage error:', error.message)
        throw new Error(error.message)
    }

    // Extract the assistant message from the OpenAI-compatible response shape
    const reply = data?.choices?.[0]?.message?.content
    if (!reply) {
        throw new Error('Empty response from chatbot.')
    }

    return reply
}

/**
 * Persist a single chat message to Supabase.
 *
 * @param {string} userId
 * @param {string|null} entryId  — the journal entry this chat belongs to
 * @param {'user'|'assistant'} role
 * @param {string} content
 * @returns {Promise<object>}
 */
export async function saveMessage(userId, entryId, role, content) {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            user_id:  userId,
            entry_id: entryId,
            role,
            content,
        })
        .select()
        .single()

    if (error) {
        console.error('[chatbotService] saveMessage error:', error.message)
        throw new Error(error.message)
    }

    return data
}

/**
 * Fetch all chat messages for a given user and entry.
 * Returns an empty array if no messages exist.
 *
 * @param {string} userId
 * @param {string} entryId
 * @returns {Promise<object[]>}
 */
export async function getMessages(userId, entryId) {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('[chatbotService] getMessages error:', error.message)
        throw new Error(error.message)
    }

    return data ?? []
}
