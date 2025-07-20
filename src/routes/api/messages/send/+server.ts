import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple rate limiting - 30 messages per user per minute
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = rateLimiter.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
        rateLimiter.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute
        return true;
    }
    
    if (userLimit.count >= 30) {
        return false;
    }
    
    userLimit.count++;
    return true;
}

export const POST: RequestHandler = async ({ locals, request }) => {
    const supabase = locals.supabase;
    const session = await locals.safeGetSession();

    if (!session.session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    if (!checkRateLimit(session.session.user.id)) {
        return json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { conversation_id, content, attachments = [] } = await request.json();

    if (!conversation_id || !content) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
            *,
            buyer:profiles!conversations_buyer_id_fkey (
                id,
                username,
                email
            ),
            seller:profiles!conversations_seller_id_fkey (
                id,
                username,
                email
            ),
            listing:listings!inner (
                title
            )
        `)
        .eq('id', conversation_id)
        .or(`buyer_id.eq.${session.session.user.id},seller_id.eq.${session.session.user.id}`)
        .single();

    if (convError || !conversation) {
        return json({ error: 'Conversation not found' }, { status: 404 });
    }

    try {
        // Create the message
        const { data: message, error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id,
                sender_id: session.session.user.id,
                message_text: content,
                attachments: attachments || [],
                is_read: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select(`
                *,
                sender:profiles!messages_sender_id_fkey (
                    id,
                    username,
                    avatar_url
                )
            `)
            .single();

        if (msgError) throw msgError;

        // Send email notification to recipient
        const isBuyer = session.session.user.id === conversation.buyer_id;
        const recipient = isBuyer ? conversation.seller : conversation.buyer;
        const sender = isBuyer ? conversation.buyer : conversation.seller;

        // Send email notification (async, don't await to avoid blocking the response)
        try {
            const { emailService } = await import('$lib/server/email');
            emailService.sendMessageNotification(
                recipient,
                sender,
                conversation.listing,
                content,
                conversationId
            ).catch(error => {
                console.error('Failed to send email notification:', error);
            });
        } catch (error) {
            console.error('Failed to load email service:', error);
        }

        return json({ message }, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return json({ error: 'Failed to send message' }, { status: 500 });
    }
};