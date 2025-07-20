import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
import { 
  apiError, 
  apiSuccess, 
  requireAuth, 
  parseRequestBody,
  validateUUID,
  handleDatabaseError 
} from '$lib/server/api-utils';
// import { rateLimiters } from '$lib/server/rate-limit';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20'
});

export const POST: RequestHandler = async (event) => {
  console.log('Payment intent endpoint called');
  const { request, locals } = event;
  
  try {
    console.log('STRIPE_SECRET_KEY:', STRIPE_SECRET_KEY ? 'Set' : 'Not set');
    console.log('Stripe instance:', stripe ? 'Created' : 'Not created');
    // Validate authentication
    const auth = await requireAuth(locals);
    if (!auth) {
      return apiError('Please log in to make a purchase', 401);
    }

    // Parse and validate request body
    const body = await parseRequestBody<{ listing_id: string; shipping_address: any }>(request);
    const { listing_id, shipping_address } = body;

    if (!listing_id || !validateUUID(listing_id)) {
      return apiError('Invalid listing ID', 400);
    }

    if (!shipping_address) {
      return apiError('Shipping address is required', 400);
    }

    const userId = auth.userId;

    // Get listing details
    const { data: listing, error: listingError } = await locals.supabase
      .from('listings')
      .select('*')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return apiError('Listing not found', 404);
    }

    // Check if user is not buying their own item
    if (listing.seller_id === userId) {
      return apiError('Cannot buy your own item', 400);
    }

    // Check if listing is available (active means available for purchase)
    if (listing.status !== 'active') {
      return apiError('Listing is no longer available', 400);
    }

    // Calculate fees
    const itemPrice = listing.price;
    const shippingPrice = listing.shipping_cost || 0;
    const subtotal = itemPrice + shippingPrice;
    
    // Buyer protection fee: 5% + $1.00
    const buyerFeePercentage = 5.0;
    const buyerFeeFixed = 1.00;
    const buyerFeeAmount = (subtotal * buyerFeePercentage / 100) + buyerFeeFixed;
    
    // Total amount buyer pays (in cents for Stripe)
    const totalAmount = Math.round((subtotal + buyerFeeAmount) * 100);
    
    // Amount seller will receive
    const sellerPayoutAmount = subtotal;

    // Generate unique order reference
    const orderRef = `DRIPLO-${Date.now()}-${listing_id.slice(-6)}`;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        order_id: orderRef,
        listing_id: listing_id,
        buyer_id: userId,
        seller_id: listing.seller_id,
        item_price: itemPrice.toString(),
        shipping_cost: shippingPrice.toString(),
        buyer_fee: buyerFeeAmount.toFixed(2),
        seller_payout: sellerPayoutAmount.toFixed(2)
      },
      description: `Purchase: ${listing.title}`,
      // Capture payment immediately - we'll handle refunds if needed
      capture_method: 'automatic',
      receipt_email: auth.session.user.email
    });

    // Create transaction record
    const transactionData = {
      id: orderRef,
      listing_id: listing_id,
      buyer_id: userId,
      seller_id: listing.seller_id,
      amount: subtotal,
      currency: 'USD',
      status: 'pending',
      payment_method: 'stripe',
      stripe_payment_intent_id: paymentIntent.id,
      buyer_fee_amount: buyerFeeAmount,
      buyer_fee_percentage: buyerFeePercentage,
      platform_fee_amount: buyerFeeAmount,
      seller_payout_amount: sellerPayoutAmount,
      seller_payout_status: 'pending',
      shipping_address: shipping_address,
      created_at: new Date().toISOString()
    };
    
    console.log('Inserting transaction data:', JSON.stringify(transactionData, null, 2));
    
    const { data: transaction, error: transactionError } = await locals.supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      // Cancel payment intent if transaction creation fails
      await stripe.paymentIntents.cancel(paymentIntent.id);
      console.error('Transaction creation error:', JSON.stringify(transactionError, null, 2));
      const errorMsg = transactionError.message || transactionError.details || JSON.stringify(transactionError);
      return apiError(`Failed to create transaction: ${errorMsg}`, 500);
    }

    // Get seller's revtag
    const { data: sellerProfile } = await locals.supabase
      .from('profiles')
      .select('revtag')
      .eq('id', listing.seller_id)
      .single();

    // Create seller payout record
    const { error: payoutError } = await locals.supabase
      .from('seller_payouts')
      .insert({
        transaction_id: orderRef,
        seller_id: listing.seller_id,
        amount: sellerPayoutAmount,
        seller_revtag: sellerProfile?.revtag || '@unknown',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (payoutError) {
      console.error('Seller payout creation error:', payoutError);
      // Don't fail the whole transaction for this
    }

    return apiSuccess({
      client_secret: paymentIntent.client_secret,
      transaction_id: transaction.id,
      order_reference: orderRef,
      item_price: itemPrice,
      shipping_cost: shippingPrice,
      subtotal: subtotal,
      buyer_fee: buyerFeeAmount,
      total_amount: subtotal + buyerFeeAmount,
      currency: 'USD',
      fee_breakdown: {
        buyer_fee_percentage: buyerFeePercentage,
        buyer_fee_fixed: buyerFeeFixed,
        buyer_fee_total: buyerFeeAmount
      }
    });

  } catch (error) {
    // Log the actual error for debugging
    console.error('Payment intent creation error:', error);
    
    // Check if it's already an API error (thrown by our utilities)
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    
    // Handle Stripe-specific errors
    if (error instanceof stripe.errors.StripeError) {
      return apiError(`Payment processing error: ${error.message}`, 400);
    }
    
    // Generic error with more details in development
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = isDev && error instanceof Error ? error.message : 'Failed to create payment intent';
    return apiError(errorMessage, 500);
  }
};