import { createClient } from '@supabase/supabase-js';

// Test database connection
const supabaseUrl = process.env['SUPABASE_URL'] || process.env['PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error('Missing Supabase environment variables for testing');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Create a test account for end-to-end testing
 * @param email - Test user email
 * @param password - Test user password
 * @returns User data
 */
export async function createAccount(email: string, password: string = 'TestPassword123!') {
	try {
		const { data, error } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true // Skip email verification for tests
		});

		if (error) {
			console.error('Error creating test account:', error);
			throw error;
		}

		return data.user;
	} catch (error) {
		console.error('Failed to create test account:', error);
		throw error;
	}
}

/**
 * Clean up test user after tests
 * @param email - Test user email to clean up
 */
export async function cleanupTestUser(email: string) {
	try {
		// Find user by email
		const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
		
		if (listError) {
			console.error('Error listing users:', listError);
			return;
		}

		const testUser = users.users.find((user: any) => user.email === email);
		
		if (testUser) {
			// Delete user profile first
			await supabaseAdmin
				.from('profiles')
				.delete()
				.eq('id', testUser.id);

			// Delete brand profile if exists
			await supabaseAdmin
				.from('brand_profiles')
				.delete()
				.eq('user_id', testUser.id);

			// Delete user from auth
			const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(testUser.id);
			
			if (deleteError) {
				console.error('Error deleting test user:', deleteError);
			} else {
				console.log(`Cleaned up test user: ${email}`);
			}
		}
	} catch (error) {
		console.error('Failed to cleanup test user:', error);
	}
}

/**
 * Create test data for onboarding tests
 * @param userId - User ID to create profile for
 * @param profileData - Profile data
 */
export async function createTestProfile(userId: string, profileData: any) {
	try {
		const { error } = await supabaseAdmin
			.from('profiles')
			.insert({
				id: userId,
				...profileData,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			});

		if (error) {
			console.error('Error creating test profile:', error);
			throw error;
		}
	} catch (error) {
		console.error('Failed to create test profile:', error);
		throw error;
	}
}

/**
 * Reset onboarding state for a user (for testing resume functionality)
 * @param userId - User ID
 * @param step - Onboarding step to set
 */
export async function setOnboardingStep(userId: string, step: number) {
	try {
		const { error } = await supabaseAdmin
			.from('profiles')
			.update({
				onboarding_step: step,
				onboarding_completed: false,
				updated_at: new Date().toISOString()
			})
			.eq('id', userId);

		if (error) {
			console.error('Error setting onboarding step:', error);
			throw error;
		}
	} catch (error) {
		console.error('Failed to set onboarding step:', error);
		throw error;
	}
}

/**
 * Get test user by email
 * @param email - User email
 * @returns User data or null
 */
export async function getTestUser(email: string) {
	try {
		const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
		
		if (error) {
			console.error('Error listing users:', error);
			return null;
		}

		return users.users.find((user: any) => user.email === email) || null;
	} catch (error) {
		console.error('Failed to get test user:', error);
		return null;
	}
}

/**
 * Wait for a specified amount of time
 * @param ms - Milliseconds to wait
 */
export function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}