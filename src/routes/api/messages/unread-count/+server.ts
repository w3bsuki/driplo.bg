import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    const supabase = locals.supabase;
    const { session } = await locals.safeGetSession();

    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get user's conversations first
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`);

        if (convError) {
            console.error('Error fetching conversations:', convError);
            return json({ error: 'Failed to fetch conversations' }, { status: 500 });
        }

        const conversationIds = conversations?.map(c => c.id) || [];

        if (conversationIds.length === 0) {
            return json({ total_unread: 0 });
        }

        // Get total unread message count for the current user
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .neq('sender_id', session.user.id)
            .in('conversation_id', conversationIds);

        if (error) {
            console.error('Error fetching unread count:', error);
            return json({ error: 'Failed to fetch unread count' }, { status: 500 });
        }

        return json({
            total_unread: count || 0
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};