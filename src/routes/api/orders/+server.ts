import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
    const supabase = locals.supabase;
    const { session } = await locals.safeGetSession();

    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const role = url.searchParams.get('role'); // 'buyer' or 'seller'
    const dateFrom = url.searchParams.get('from');
    const dateTo = url.searchParams.get('to');

    let query = supabase
        .from('orders')
        .select(`
            *,
            buyer:profiles!orders_buyer_id_fkey (
                id,
                username,
                avatar_url
            ),
            seller:profiles!orders_seller_id_fkey (
                id,
                username,
                avatar_url
            ),
            order_items (
                *,
                listing:listings (
                    id,
                    title,
                    images
                )
            ),
            transaction:transactions (
                id,
                stripe_payment_intent_id,
                stripe_charge_id
            )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Filter by role
    if (role === 'buyer') {
        query = query.eq('buyer_id', session.user.id);
    } else if (role === 'seller') {
        query = query.eq('seller_id', session.user.id);
    } else {
        query = query.or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`);
    }

    // Filter by status
    if (status) {
        query = query.eq('status', status);
    }

    // Filter by date range
    if (dateFrom) {
        query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
        query = query.lte('created_at', dateTo + 'T23:59:59.999Z');
    }

    const { data: orders, error } = await query;

    if (error) {
        console.error('Error fetching orders:', error);
        return json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return json({
        orders: orders || [],
        hasMore: orders?.length === limit
    });
};

export const POST: RequestHandler = async ({ locals, request }) => {
    const supabase = locals.supabase;
    const { session } = await locals.safeGetSession();

    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
        listing_id, 
        transaction_id,
        shipping_address,
        shipping_method 
    } = await request.json();

    if (!listing_id || !transaction_id || !shipping_address) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Get listing and transaction details
        const [listingResult, transactionResult] = await Promise.all([
            supabase
                .from('listings')
                .select('*, seller:profiles!listings_seller_id_fkey(id, username, email)')
                .eq('id', listing_id)
                .single(),
            supabase
                .from('transactions')
                .select('*')
                .eq('id', transaction_id)
                .eq('buyer_id', session.user.id)
                .single()
        ]);

        if (listingResult.error || !listingResult.data) {
            return json({ error: 'Listing not found' }, { status: 404 });
        }

        if (transactionResult.error || !transactionResult.data) {
            return json({ error: 'Transaction not found' }, { status: 404 });
        }

        const listing = listingResult.data;
        const transaction = transactionResult.data;

        // Generate order number
        const { data: orderNumber } = await supabase.rpc('generate_order_number');

        // Calculate totals
        const subtotal = listing.price;
        const shipping_cost = listing.shipping_cost || 0;
        const total_amount = subtotal + shipping_cost;

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                buyer_id: session.user.id,
                seller_id: listing.seller_id,
                transaction_id,
                status: 'confirmed',
                shipping_address,
                shipping_method: shipping_method || 'standard',
                subtotal,
                shipping_cost,
                tax_amount: 0,
                total_amount,
                confirmed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order item
        const { error: itemError } = await supabase
            .from('order_items')
            .insert({
                order_id: order.id,
                listing_id: listing.id,
                quantity: 1,
                price: listing.price,
                total: listing.price,
                item_snapshot: {
                    title: listing.title,
                    description: listing.description,
                    images: listing.images,
                    size: listing.size,
                    condition: listing.condition,
                    brand: listing.brand
                }
            });

        if (itemError) throw itemError;

        // Add status history entry
        await supabase
            .from('order_status_history')
            .insert({
                order_id: order.id,
                to_status: 'confirmed',
                changed_by: session.user.id,
                reason: 'Order placed successfully'
            });

        // Update listing status to sold
        await supabase
            .from('listings')
            .update({ status: 'sold' })
            .eq('id', listing_id);

        return json({ order }, { status: 201 });
    } catch (error) {
        console.error('Error creating order:', error);
        return json({ error: 'Failed to create order' }, { status: 500 });
    }
};