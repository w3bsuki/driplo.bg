import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { logger } from '$lib/utils/logger';
import { emailService } from '$lib/server/email';

export const POST: RequestHandler = async ({ locals, params, request }) => {
    const supabase = locals.supabase;
    const { session } = await locals.safeGetSession();

    if (!session) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id;
    const { 
        shipping_carrier, 
        tracking_number,
        shipping_label_url 
    } = await request.json();

    if (!shipping_carrier || !tracking_number) {
        return json({ error: 'Missing required shipping information' }, { status: 400 });
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            buyer:profiles!orders_buyer_id_fkey (
                id,
                username,
                email
            ),
            order_items (
                listing:listings (
                    title
                )
            )
        `)
        .eq('id', orderId)
        .eq('seller_id', session.user.id)
        .single();

    if (orderError || !order) {
        return json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'confirmed' && order.status !== 'processing') {
        return json({ error: 'Order cannot be shipped in current status' }, { status: 400 });
    }

    try {
        // Update order status to shipped
        await supabase.rpc('update_order_status', {
            p_order_id: orderId,
            p_new_status: 'shipped',
            p_user_id: session.user.id,
            p_reason: 'Order shipped',
            p_metadata: {
                shipping_carrier,
                tracking_number,
                shipping_label_url
            }
        });

        // Update order with shipping details
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                shipping_carrier,
                tracking_number,
                shipping_label_url,
                shipped_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        // Add shipping event
        await supabase
            .from('shipping_events')
            .insert({
                order_id: orderId,
                event_type: 'shipped',
                event_description: `Package shipped via ${shipping_carrier}`,
                carrier_data: {
                    carrier: shipping_carrier,
                    tracking_number,
                    label_url: shipping_label_url
                }
            });

        // Send email notification to buyer
        try {
            if (order.buyer?.email) {
                const listing = order.order_items?.[0]?.listing;
                if (listing) {
                    await emailService.sendShippingUpdate(
                        order.buyer,
                        listing,
                        tracking_number
                    );
                }
            }
        } catch (emailError) {
            logger.error('Failed to send shipping email:', emailError);
            // Don't fail the request if email fails
        }

        return json({ 
            success: true,
            message: 'Order marked as shipped',
            tracking_number,
            shipping_carrier
        });
    } catch (error) {
        logger.error('Error shipping order', error);
        return json({ error: 'Failed to ship order' }, { status: 500 });
    }
};