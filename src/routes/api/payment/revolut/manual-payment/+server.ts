import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const supabase = locals.supabase;
	console.log('🔥 Manual Revolut payment endpoint called');
	try {
		const { listing_id } = await request.json();
		console.log('📦 Listing ID:', listing_id);

		// Check if user is authenticated
		const session = await locals.supabase.auth.getSession();
		console.log('Session data:', session.data);
		if (!session.data.session) {
			console.log('No session found, user is not authenticated');
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.data.session.user.id;

		// Get listing details
		const { data: listing, error: listingError } = await supabase
			.from('listings')
			.select('*')
			.eq('id', listing_id)
			.single();

		if (listingError || !listing) {
			console.error('Listing error:', listingError);
			return json({ error: 'Listing not found' }, { status: 404 });
		}

		// Check if user is not buying their own item
		if (listing.seller_id === userId) {
			return json({ error: 'Cannot buy your own item' }, { status: 400 });
		}

		// Get seller's payment account (optional - we'll contact them later for payout)
		const { data: sellerPaymentAccount, error: paymentError } = await supabase
			.from('payment_accounts')
			.select('*')
			.eq('user_id', listing.seller_id)
			.single();

		// If seller doesn't have payment account, we'll handle it during payout
		// Payment still goes to platform account for buyer protection
		console.log('Seller payment account status:', sellerPaymentAccount ? 'Found' : 'Not found - will contact seller for payout');

		// Calculate marketplace fees
		const itemPrice = listing.price;
		const shippingPrice = listing.shipping_cost || 0;
		const subtotal = itemPrice + shippingPrice;
		
		// Buyer protection fee: 5% + $1.00
		const buyerFeePercentage = 5.0;
		const buyerFeeFixed = 1.00;
		const buyerFeeAmount = (subtotal * buyerFeePercentage / 100) + buyerFeeFixed;
		
		// Total amount buyer pays
		const totalAmount = subtotal + buyerFeeAmount;
		
		// Amount seller will receive (full item price + shipping)
		const sellerPayoutAmount = subtotal;

		// Validate that listing_id is a valid UUID
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(listing_id)) {
			return json({ error: 'Invalid listing ID format' }, { status: 400 });
		}

		// Generate unique order reference
		const orderRef = `DRIPLO-${Date.now()}-${listing_id.slice(-4)}`;

		// We already have the seller's payment account from the query above

		// Create transaction record with escrow system
		const { data: transaction, error: transactionError } = await supabase
			.from('transactions')
			.insert({
				id: orderRef,
				listing_id: listing_id,
				buyer_id: userId,
				seller_id: listing.seller_id,
				amount: subtotal,
				currency: 'USD',
				status: 'pending',
				payment_method: 'revolut_manual',
				seller_revtag_encrypted: sellerPaymentAccount?.revtag || null, // Store encrypted in production
				buyer_fee_amount: buyerFeeAmount,
				buyer_fee_percentage: buyerFeePercentage,
				platform_fee_amount: buyerFeeAmount, // Platform keeps the buyer fee
				seller_payout_amount: sellerPayoutAmount,
				seller_payout_status: 'pending',
				created_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (transactionError) {
			console.error('Transaction creation error:', transactionError);
			return json({ error: 'Failed to create transaction' }, { status: 500 });
		}

		// Create seller payout record for admin tracking
		const { error: payoutError } = await supabase
			.from('seller_payouts')
			.insert({
				transaction_id: orderRef,
				seller_id: listing.seller_id,
				amount: sellerPayoutAmount,
				seller_revtag: sellerPaymentAccount?.revtag || 'NOT_SET', // Will be updated when seller sets up account
				status: 'pending',
				created_at: new Date().toISOString(),
			});

		if (payoutError) {
			console.error('Payout record creation error:', payoutError);
			// Don't fail the transaction, just log the error
		}

		return json({
			transaction_id: transaction.id,
			order_reference: orderRef,
			item_price: itemPrice,
			shipping_cost: shippingPrice,
			subtotal: subtotal,
			buyer_fee: buyerFeeAmount,
			total_amount: totalAmount,
			currency: 'USD',
			fee_breakdown: {
				buyer_fee_percentage: buyerFeePercentage,
				buyer_fee_fixed: buyerFeeFixed,
				buyer_fee_total: buyerFeeAmount
			},
			payment_instructions: {
				// TODO: Replace with proper business payment solution
				error: "Manual payments temporarily disabled - payment integration pending",
				reference: orderRef
			},
		});

	} catch (error) {
		console.error('Manual Revolut payment creation error:', error);
		console.error('Error details:', error.message);
		console.error('Stack trace:', error.stack);
		return json({ error: 'Internal server error', details: error.message }, { status: 500 });
	}
};

// Endpoint to confirm manual payment
export const PATCH: RequestHandler = async ({ request, locals }) => {
	const supabase = locals.supabase;
	try {
		const { transaction_id } = await request.json();

		// Check if user is authenticated
		const session = await locals.supabase.auth.getSession();
		if (!session.data.session) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.data.session.user.id;

		// Update transaction with proof of payment
		const { data: transaction, error: updateError } = await supabase
			.from('transactions')
			.update({
				status: 'payment_submitted', // Status indicating payment proof submitted
				updated_at: new Date().toISOString(),
			})
			.eq('id', transaction_id)
			.eq('buyer_id', userId) // Ensure user can only update their own transactions
			.select()
			.single();

		if (updateError || !transaction) {
			return json({ error: 'Failed to update transaction' }, { status: 500 });
		}

		return json({
			success: true,
			transaction_id: transaction.id,
			status: 'payment_submitted',
			message: 'Payment proof submitted successfully. We will verify and confirm your order.',
		});

	} catch (error) {
		console.error('Payment confirmation error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};