import { redirect, fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad, Actions } from './$types';
import { isolatedOnboardingSchema } from '$lib/schemas/onboarding-isolated';
import { logger } from '$lib/utils/logger';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();
	
	// Redirect to login if not authenticated
	if (!session || !user) {
		throw redirect(303, '/login');
	}
	
	// Get user profile for onboarding checks
	const { data: profile } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single();
	
	return {
		user,
		profile
	};
};

// Server actions for onboarding steps
export const actions: Actions = {
	// Save step progress and data
	saveStep: async ({ locals: { safeGetSession, supabase }, request }) => {
		const { session, user } = await safeGetSession();
		
		if (!session || !user) {
			return fail(401, { error: 'Not authenticated' });
		}

		try {
			const formData = await request.formData();
			const stepData = JSON.parse(formData.get('stepData') as string);
			const stepNumber = parseInt(formData.get('stepNumber') as string);

			logger.info('Saving onboarding step', { userId: user.id, step: stepNumber, data: stepData });

			// Prepare update data
			const updateData: any = { 
				onboarding_step: stepNumber,
				updated_at: new Date().toISOString()
			};

			// Add specific step data
			if (stepData.username) {
				updateData.username = stepData.username.toLowerCase();
				updateData.needs_username_setup = false;
			}
			if (stepData.accountType) updateData.account_type = stepData.accountType;
			if (stepData.fullName) updateData.full_name = stepData.fullName;
			if (stepData.bio !== undefined) updateData.bio = stepData.bio;
			if (stepData.location !== undefined) updateData.location = stepData.location;
			if (stepData.paymentMethods) updateData.payment_methods = stepData.paymentMethods;
			if (stepData.revolut_tag) updateData.revolut_tag = stepData.revolut_tag;
			if (stepData.paypal_tag) updateData.paypal_tag = stepData.paypal_tag;
			if (stepData.avatarUrl) updateData.avatar_url = stepData.avatarUrl;

			// Try to update first
			const { count, error: updateError } = await supabase
				.from('profiles')
				.update(updateData)
				.eq('id', user.id)
				.select('*', { count: 'exact', head: true });

			if (updateError) {
				logger.error('Step update error:', updateError);
				return fail(500, { error: updateError.message });
			}

			// If no rows updated, create the profile
			if (count === 0) {
				const createData = {
					id: user.id,
					email: user.email,
					...updateData,
					created_at: new Date().toISOString()
				};
				
				const { error: insertError } = await supabase
					.from('profiles')
					.insert(createData);
					
				if (insertError) {
					logger.error('Profile creation error:', insertError);
					return fail(500, { error: insertError.message });
				}
			}

			return { success: true };
		} catch (error: any) {
			logger.error('Failed to save step:', error);
			return fail(500, { error: error.message });
		}
	},

	// Create brand profile
	createBrand: async ({ locals: { safeGetSession, supabase }, request }) => {
		const { session, user } = await safeGetSession();
		
		if (!session || !user) {
			return fail(401, { error: 'Not authenticated' });
		}

		try {
			const formData = await request.formData();
			const brandData = JSON.parse(formData.get('brandData') as string);

			logger.info('Creating brand profile', { userId: user.id, brandData });

			// Generate unique brand slug
			const baseSlug = brandData.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
			let brandSlug = baseSlug;
			let counter = 0;
			
			while (true) {
				const { data } = await supabase
					.from('brand_profiles')
					.select('id')
					.eq('brand_slug', brandSlug)
					.single();
				
				if (!data) break;
				
				counter++;
				brandSlug = `${baseSlug}-${counter}`;
			}

			// Insert brand profile
			const { error } = await supabase.from('brand_profiles').insert({
				user_id: user.id,
				brand_name: brandData.brandName,
				brand_slug: brandSlug,
				brand_description: brandData.brandDescription,
				instagram_url: brandData.socialMediaAccounts?.find((a: any) => a.platform === 'instagram')?.url,
				facebook_url: brandData.socialMediaAccounts?.find((a: any) => a.platform === 'facebook')?.url,
				twitter_url: brandData.socialMediaAccounts?.find((a: any) => a.platform === 'twitter')?.url,
				tiktok_url: brandData.socialMediaAccounts?.find((a: any) => a.platform === 'tiktok')?.url
			});

			if (error) {
				logger.error('Brand creation error:', error);
				return fail(500, { error: error.message });
			}

			return { success: true, brandSlug };
		} catch (error: any) {
			logger.error('Failed to create brand:', error);
			return fail(500, { error: error.message });
		}
	},

	// Complete onboarding
	complete: async ({ locals: { safeGetSession, supabase }, request }) => {
		const { session, user } = await safeGetSession();
		
		if (!session || !user) {
			return fail(401, { error: 'Not authenticated' });
		}

		try {
			const formData = await request.formData();
			const finalData = JSON.parse(formData.get('finalData') as string);

			logger.info('Completing onboarding', { userId: user.id });

			// Validate with schema
			const validatedData = isolatedOnboardingSchema.parse(finalData);

			// Final update to mark onboarding complete
			const { error } = await supabase
				.from('profiles')
				.update({
					onboarding_completed: true,
					onboarding_step: null,
					needs_username_setup: false,
					updated_at: new Date().toISOString()
				})
				.eq('id', user.id);

			if (error) {
				logger.error('Onboarding completion error:', error);
				return fail(500, { error: error.message });
			}

			return { success: true };
		} catch (error: any) {
			if (error instanceof z.ZodError) {
				logger.error('Validation error on completion:', error);
				return fail(400, { error: 'Invalid form data', validation: error.errors });
			}
			
			logger.error('Failed to complete onboarding:', error);
			return fail(500, { error: error.message });
		}
	}
};