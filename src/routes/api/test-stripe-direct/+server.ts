import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    // Try to initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20'
    });
    
    // Try a simple API call
    const account = await stripe.accounts.retrieve();
    
    return new Response(JSON.stringify({
      success: true,
      accountId: account.id,
      country: account.country
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      type: error.type,
      code: error.code
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};