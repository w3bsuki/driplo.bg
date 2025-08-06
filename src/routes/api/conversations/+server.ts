import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/utils/supabase/server';
import { logger } from '$lib/services/logger';

// GET - Fetch user's conversations
export const GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			logger.warn('Conversations request without authentication', { authError: authError?.message });
			return json({ error: 'You must be logged in to view conversations' }, { status: 401 });
		}

		// Optional query parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;

		// Fetch conversations where user is either buyer or seller
		const { data: conversations, error: conversationsError } = await supabase
			.from('conversations')
			.select(`
				*,
				listing:listings(id, title, price, status, images),
				buyer:profiles!buyer_id(id, username, avatar_url, full_name),
				seller:profiles!seller_id(id, username, avatar_url, full_name),
				last_message:messages(id, message_text, created_at, sender_id, is_read)
			`)
			.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
			.eq('last_message.conversation_id', 'id')
			.order('last_message_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (conversationsError) {
			logger.error('Error fetching conversations', { 
				userId: user.id, 
				error: conversationsError.message 
			});
			return json({ error: 'Failed to fetch conversations' }, { status: 500 });
		}

		// Get the latest message for each conversation separately since the join is complex
		const conversationIds = conversations?.map(c => c.id) || [];
		let lastMessages: any[] = [];
		
		if (conversationIds.length > 0) {
			const { data: messages } = await supabase
				.from('messages')
				.select('*')
				.in('conversation_id', conversationIds)
				.order('created_at', { ascending: false });

			// Group by conversation_id and take the first (latest) message
			const messagesByConv = messages?.reduce((acc, msg) => {
				if (!acc[msg.conversation_id]) {
					acc[msg.conversation_id] = msg;
				}
				return acc;
			}, {} as Record<string, any>) || {};

			lastMessages = conversationIds.map(id => messagesByConv[id]).filter(Boolean);
		}

		// Merge last messages with conversations
		const conversationsWithMessages = conversations?.map(conv => ({
			...conv,
			last_message: lastMessages.find(msg => msg.conversation_id === conv.id) || null
		})) || [];

		logger.info('Conversations fetched', { 
			userId: user.id, 
			count: conversationsWithMessages.length,
			page,
			limit
		});

		return json({
			conversations: conversationsWithMessages,
			page,
			limit,
			total: conversationsWithMessages.length
		});

	} catch (error) {
		logger.error('Unexpected error in conversations endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};

// POST - Start a new conversation
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const supabase = createSupabaseServerClient(cookies);
		
		// Get the current user
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			logger.warn('Start conversation attempt without authentication', { authError: authError?.message });
			return json({ error: 'You must be logged in to start conversations' }, { status: 401 });
		}

		const { listing_id, message_text } = await request.json();
		
		if (!listing_id || !message_text?.trim()) {
			return json({ error: 'Listing ID and message are required' }, { status: 400 });
		}

		// Get the listing and seller info
		const { data: listing, error: listingError } = await supabase
			.from('listings')
			.select('id, title, seller_id')
			.eq('id', listing_id)
			.single();

		if (listingError || !listing) {
			logger.warn('Attempt to start conversation for non-existent listing', { 
				listing_id, 
				error: listingError?.message 
			});
			return json({ error: 'Listing not found' }, { status: 404 });
		}

		// Prevent users from messaging themselves
		if (user.id === listing.seller_id) {
			return json({ error: 'You cannot message yourself about your own listing' }, { status: 400 });
		}

		// Check if conversation already exists
		const { data: existingConversation } = await supabase
			.from('conversations')
			.select('id')
			.eq('listing_id', listing_id)
			.eq('buyer_id', user.id)
			.eq('seller_id', listing.seller_id)
			.single();

		let conversationId: string;

		if (existingConversation) {
			conversationId = existingConversation.id;
		} else {
			// Create new conversation
			const { data: newConversation, error: conversationError } = await supabase
				.from('conversations')
				.insert({
					listing_id: listing_id,
					buyer_id: user.id,
					seller_id: listing.seller_id,
					last_message_at: new Date().toISOString()
				})
				.select('id')
				.single();

			if (conversationError || !newConversation) {
				logger.error('Error creating conversation', { 
					listing_id,
					buyer_id: user.id,
					seller_id: listing.seller_id,
					error: conversationError?.message 
				});
				return json({ error: 'Failed to start conversation' }, { status: 500 });
			}

			conversationId = newConversation.id;
		}

		// Add the message
		const { data: message, error: messageError } = await supabase
			.from('messages')
			.insert({
				conversation_id: conversationId,
				sender_id: user.id,
				message_text: message_text.trim()
			})
			.select('*')
			.single();

		if (messageError || !message) {
			logger.error('Error sending initial message', { 
				conversation_id: conversationId,
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

		logger.info('New conversation started', { 
			conversation_id: conversationId,
			listing_id,
			buyer_id: user.id,
			seller_id: listing.seller_id
		});

		return json({ 
			conversation_id: conversationId,
			message,
			success: true 
		}, { status: 201 });

	} catch (error) {
		logger.error('Unexpected error in start conversation endpoint', { error });
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};