import { STRIPE_SECRET_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify({
    keyExists: !!STRIPE_SECRET_KEY,
    keyPrefix: STRIPE_SECRET_KEY?.substring(0, 7),
    isPlaceholder: STRIPE_SECRET_KEY === 'your_stripe_secret_key'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};