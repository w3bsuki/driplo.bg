import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/utils/supabase/server';
import { logger } from '$lib/services/logger';

// GET - Fetch messages in a conversation
export const GET: RequestHandler = async ({ url, params, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			logger.warn('Messages request without authentication', { authError: authError?.message });
			return json({ error: 'You must be logged in to view messages' }, { status: 401 });
		}

		const conversationId = params.id;
		if (!conversationId) {
			return json({ error: 'Conversation ID is required' }, { status: 400 });
		}

		// Verify user has access to this conversation
		const { data: conversation, error: conversationError } = await supabase
			.from('conversations')
			.select('id, buyer_id, seller_id, listing:listings(id, title)')
			.eq('id', conversationId)
			.single();

		if (conversationError || !conversation) {
			logger.warn('Attempt to access non-existent conversation', { 
				conversationId, 
				userId: user.id,
				error: conversationError?.message 
			});
			return json({ error: 'Conversation not found' }, { status: 404 });
		}

		// Check if user is part of this conversation
		if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
			logger.warn('Unauthorized conversation access attempt', { 
				conversationId,
				userId: user.id,
				buyerId: conversation.buyer_id,
				sellerId: conversation.seller_id
			});
			return json({ error: 'You do not have access to this conversation' }, { status: 403 });
		}

		// Pagination parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = (page - 1) * limit;

		// Fetch messages
		const { data: messages, error: messagesError } = await supabase
			.from('messages')
			.select(`
				*,
				sender:profiles!sender_id(id, username, avatar_url, full_name)
			`)
			.eq('conversation_id', conversationId)
			.order('created_at', { ascending: true })
			.range(offset, offset + limit - 1);

		if (messagesError) {
			logger.error('Error fetching messages', { 
				conversationId,
				userId: user.id,
				error: messagesError.message 
			});
			return json({ error: 'Failed to fetch messages' }, { status: 500 });
		}

		// Mark messages as read for the current user
		const unreadMessageIds = messages
			?.filter(msg => msg.sender_id !== user.id && !msg.is_read)
			.map(msg => msg.id) || [];

		if (unreadMessageIds.length > 0) {
			await supabase
				.from('messages')
				.update({ 
					is_read: true, 
					read_at: new Date().toISOString() 
				})
				.in('id', unreadMessageIds);
		}

		logger.info('Messages fetched and marked as read', { 
			conversationId,
			userId: user.id,
			messageCount: messages?.length || 0,
			markedAsRead: unreadMessageIds.length
		});

		return json({
			messages: messages || [],
			conversation,
			page,
			limit
		});

	} catch (error) {
		logger.error('Unexpected error in messages endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};

// POST - Send a new message
export const POST: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			logger.warn('Send message attempt without authentication', { authError: authError?.message });
			return json({ error: 'You must be logged in to send messages' }, { status: 401 });
		}

		const conversationId = params.id;
		if (!conversationId) {
			return json({ error: 'Conversation ID is required' }, { status: 400 });
		}

		const { message_text, attachments } = await request.json();
		
		if (!message_text?.trim()) {
			return json({ error: 'Message text is required' }, { status: 400 });
		}

		// Verify user has access to this conversation
		const { data: conversation, error: conversationError } = await supabase
			.from('conversations')
			.select('id, buyer_id, seller_id')
			.eq('id', conversationId)
			.single();

		if (conversationError || !conversation) {
			logger.warn('Attempt to send message to non-existent conversation', { 
				conversationId, 
				userId: user.id,
				error: conversationError?.message 
			});
			return json({ error: 'Conversation not found' }, { status: 404 });
		}

		// Check if user is part of this conversation
		if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
			logger.warn('Unauthorized message send attempt', { 
				conversationId,
				userId: user.id,
				buyerId: conversation.buyer_id,
				sellerId: conversation.seller_id
			});
			return json({ error: 'You do not have access to this conversation' }, { status: 403 });
		}

		// Create the message
		const { data: message, error: messageError } = await supabase
			.from('messages')
			.insert({
				conversation_id: conversationId,
				sender_id: user.id,
				message_text: message_text.trim(),
				attachments: attachments || null
			})
			.select(`
				*,
				sender:profiles!sender_id(id, username, avatar_url, full_name)
			`)
			.single();

		if (messageError || !message) {
			logger.error('Error creating message', { 
				conversationId,
				sender_id: user.id,
				error: messageError?.message 
			});
			return json({ error: 'Failed to send message' }, { status: 500 });
		}

		// Update conversation's last_message_at
		await supabase
			.from('conversations')
			.update({ last_message_at: message.created_at })
			.eq('id', conversationId);

		logger.info('Message sent', { 
			messageId: message.id,
			conversationId,
			senderId: user.id
		});

		return json({ 
			message,
			success: true 
		}, { status: 201 });

	} catch (error) {
		logger.error('Unexpected error in send message endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};