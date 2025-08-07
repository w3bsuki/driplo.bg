import type { RequestHandler } from './$types';
import { apiError, apiSuccess, ApiErrorType, requireAuth } from '$lib/server/api-utils';
import type { UnreadCountResponse } from '$lib/types/api.types';

export const GET: RequestHandler = async ({ locals }) => {
    const requestId = crypto.randomUUID();
    
    try {
        // Check if supabase client exists
        if (!locals.supabase) {
            const response: UnreadCountResponse = { count: 0 };
            return apiSuccess(response, 200, requestId);
        }
        
        // Get session with secure validation
        const { session, user } = await locals.safeGetSession();
        
        if (!session || !user) {
            // Return 0 for unauthenticated users
            const response: UnreadCountResponse = { count: 0 };
            return apiSuccess(response, 200, requestId);
        }
        
        const userId = user.id;

        // Get user's conversations first
        const { data: conversations, error: convError } = await locals.supabase
            .from('conversations')
            .select('id')
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

        if (convError) {
            // Return 0 on error instead of 500
            const response: UnreadCountResponse = { count: 0 };
            return apiSuccess(response, 200, requestId);
        }

        const conversationIds = conversations?.map(c => c.id) || [];

        if (conversationIds.length === 0) {
            const response: UnreadCountResponse = { count: 0 };
            return apiSuccess(response, 200, requestId);
        }

        // Get total unread message count for the current user
        const { count, error } = await locals.supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false)
            .neq('sender_id', userId)
            .in('conversation_id', conversationIds);

        if (error) {
            // Return 0 on error instead of 500
            const response: UnreadCountResponse = { count: 0 };
            return apiSuccess(response, 200, requestId);
        }

        const response: UnreadCountResponse = { count: count || 0 };
        return apiSuccess(response, 200, requestId);
    } catch (error) {
        // Always return success with 0 count to prevent client errors
        const response: UnreadCountResponse = { count: 0 };
        return apiSuccess(response, 200, requestId);
    }
};