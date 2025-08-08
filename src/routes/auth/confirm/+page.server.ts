import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';
import { logger } from '$lib/utils/logger';

export const load: PageServerLoad = async ({ url, locals: { supabase, locale } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') || 'email';
	const next = url.searchParams.get('next') ?? '/onboarding?new=true';
	
	// Helper to create localized URLs
	const getLocalizedUrl = (path: string) => {
		if (locale && locale !== 'en') {
			return `/${locale}${path}`;
		}
		return path;
	};

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({
			type: type as any,
			token_hash,
		});

		if (!error) {
			// Email verified successfully, redirect to next page
			redirect(303, next);
		} else {
			logger.error('Email verification error:', error);
			// Handle different error cases
			if (error instanceof AuthApiError) {
				if (error.message.includes('expired')) {
					redirect(303, getLocalizedUrl('/login?error=verification_expired'));
				} else if (error.message.includes('invalid')) {
					redirect(303, getLocalizedUrl('/login?error=invalid_token'));
				}
			}
			// Generic error
			redirect(303, getLocalizedUrl('/login?error=verification_failed'));
		}
	}

	// No token provided
	redirect(303, getLocalizedUrl('/login?error=missing_token'));
};