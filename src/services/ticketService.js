/**
 * ticketService — contact form rows in `tickets` (manual review in Supabase SQL).
 */
import { supabase } from '@/config/supabase'

/**
 * Insert a support ticket for the signed-in user.
 *
 * @param {string} userId
 * @param {{ name: string, email: string, message: string }} fields
 */
export async function submitTicket(userId, { name, email, message }) {
    const { data, error } = await supabase
        .from('tickets')
        .insert({
            user_id: userId,
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
        })
        .select()
        .single()

    if (error) {
        console.error('[ticketService] submitTicket:', error.message)
        throw new Error(error.message)
    }

    return data
}
