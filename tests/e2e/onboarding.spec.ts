import { test, expect } from '@playwright/test';
import { cleanupTestUser } from '../setup';

test.describe('Onboarding Flow', () => {
	let testUserEmail: string;

	test.beforeEach(async () => {
		// Generate unique test user email
		testUserEmail = `test-onboarding-${Date.now()}@example.com`;
	});

	test.afterEach(async () => {
		// Clean up test user after each test
		if (testUserEmail) {
			await cleanupTestUser(testUserEmail);
		}
	});

	test('Personal user onboarding - complete flow', async ({ page }) => {
		// Step 1: Register new account
		await page.goto('/register');
		
		await page.fill('input[name="email"]', testUserEmail);
		await page.fill('input[name="password"]', 'TestPassword123!');
		await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
		await page.check('input[name="agreedToTerms"]');
		await page.click('input[value="personal"]');
		
		await page.click('button[type="submit"]');
		
		// Should show success message
		await expect(page.locator('text=Check your email')).toBeVisible();
		
		// Step 2: Navigate directly to onboarding (simulating email verification)
		await page.goto('/onboarding?new=true');
		
		// Step 3: Username setup
		await expect(page.locator('h2:text("Username")')).toBeVisible();
		await page.fill('input[name="username"]', `testuser${Date.now()}`);
		await page.click('button:text("Continue")');
		
		// Step 4: Account Type selector
		await expect(page.locator('h2:text("Account Type")')).toBeVisible();
		await page.click('input[value="personal"]');
		await page.click('button:text("Continue")');
		
		// Step 5: Profile setup
		await expect(page.locator('h2:text("Profile")')).toBeVisible();
		await page.fill('input[name="fullName"]', 'Test User');
		await page.fill('textarea[name="bio"]', 'This is a test bio');
		await page.fill('input[name="location"]', 'Test City');
		await page.click('button:text("Continue")');
		
		// Step 6: Payment setup (optional)
		await expect(page.locator('h2:text("Payment")')).toBeVisible();
		await page.click('button:text("Continue")'); // Skip payment
		
		// Step 7: Complete
		await expect(page.locator('h2:text("Complete")')).toBeVisible();
		await page.click('button:text("Complete")');
		
		// Should redirect to home page
		await expect(page).toHaveURL('/');
		await expect(page.locator('text=Welcome to Driplo!')).toBeVisible();
	});

	test('Brand user onboarding - complete flow with brand step', async ({ page }) => {
		// Step 1: Register new brand account
		await page.goto('/register');
		
		await page.fill('input[name="email"]', testUserEmail);
		await page.fill('input[name="password"]', 'TestPassword123!');
		await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
		await page.check('input[name="agreedToTerms"]');
		await page.click('input[value="brand"]');
		await page.fill('input[name="brandName"]', 'Test Brand');
		
		await page.click('button[type="submit"]');
		
		// Step 2: Navigate to onboarding
		await page.goto('/onboarding?new=true');
		
		// Step 3: Username setup
		await page.fill('input[name="username"]', `testbrand${Date.now()}`);
		await page.click('button:text("Continue")');
		
		// Step 4: Account Type - should default to brand
		await page.click('input[value="brand"]');
		await page.click('button:text("Continue")');
		
		// Step 5: Profile setup
		await page.fill('input[name="fullName"]', 'Test Brand Owner');
		await page.fill('textarea[name="bio"]', 'Test brand owner bio');
		await page.click('button:text("Continue")');
		
		// Step 6: Payment setup (skip)
		await page.click('button:text("Continue")');
		
		// Step 7: Brand Info (should appear for brand accounts)
		await expect(page.locator('h2:text("Brand Info")')).toBeVisible();
		await page.fill('input[name="brandName"]', 'Test Brand');
		await page.fill('textarea[name="brandDescription"]', 'This is a test brand description with more than 10 characters');
		await page.click('button:text("Continue")');
		
		// Step 8: Complete
		await expect(page.locator('h2:text("Complete")')).toBeVisible();
		await page.click('button:text("Complete")');
		
		// Should redirect to home page
		await expect(page).toHaveURL('/');
		await expect(page.locator('text=Welcome to Driplo!')).toBeVisible();
	});

	test('Onboarding form validation', async ({ page }) => {
		await page.goto('/onboarding');
		
		// Username validation
		await expect(page.locator('h2:text("Username")')).toBeVisible();
		
		// Test short username
		await page.fill('input[name="username"]', 'ab');
		await page.click('button:text("Continue")');
		// Should stay on same step due to validation
		await expect(page.locator('h2:text("Username")')).toBeVisible();
		
		// Test valid username
		await page.fill('input[name="username"]', 'validusername123');
		await page.click('button:text("Continue")');
		
		// Account type
		await page.click('input[value="personal"]');
		await page.click('button:text("Continue")');
		
		// Profile validation - test short name
		await page.fill('input[name="fullName"]', 'A');
		await page.click('button:text("Continue")');
		// Should stay on same step
		await expect(page.locator('h2:text("Profile")')).toBeVisible();
		
		// Test valid name
		await page.fill('input[name="fullName"]', 'Valid Name');
		await page.click('button:text("Continue")');
		
		// Should proceed to payment step
		await expect(page.locator('h2:text("Payment")')).toBeVisible();
	});

	test('Onboarding navigation - back button functionality', async ({ page }) => {
		await page.goto('/onboarding');
		
		// Start from username step
		await page.fill('input[name="username"]', 'testuser123');
		await page.click('button:text("Continue")');
		
		// Move to account type
		await page.click('input[value="personal"]');
		await page.click('button:text("Continue")');
		
		// Now on profile step - test back button
		await expect(page.locator('h2:text("Profile")')).toBeVisible();
		await page.click('button:text("← Back")');
		
		// Should be back on account type step
		await expect(page.locator('h2:text("Account Type")')).toBeVisible();
		
		// Go back again
		await page.click('button:text("← Back")');
		
		// Should be back on username step
		await expect(page.locator('h2:text("Username")')).toBeVisible();
		
		// First step should disable back button
		const backButton = page.locator('button:text("← Back")');
		await expect(backButton).toBeDisabled();
	});

	test('Onboarding progress indicator', async ({ page }) => {
		await page.goto('/onboarding');
		
		// Check initial progress
		await expect(page.locator('text=Step 1 of')).toBeVisible();
		
		// Progress through steps and verify progress updates
		await page.fill('input[name="username"]', 'testuser123');
		await page.click('button:text("Continue")');
		
		await expect(page.locator('text=Step 2 of')).toBeVisible();
		
		await page.click('input[value="personal"]');
		await page.click('button:text("Continue")');
		
		await expect(page.locator('text=Step 3 of')).toBeVisible();
	});

	test('Onboarding accessibility', async ({ page }) => {
		await page.goto('/onboarding');
		
		// Check that form has proper labels
		await expect(page.locator('label[for*="username"]')).toBeVisible();
		
		// Check that buttons are keyboard accessible
		await page.keyboard.press('Tab');
		await expect(page.locator('input[name="username"]')).toBeFocused();
		
		// Check aria attributes
		const continueButton = page.locator('button:text("Continue")');
		await expect(continueButton).toHaveAttribute('type', 'button');
	});

	test('Onboarding resume functionality', async ({ page }) => {
		// Start onboarding
		await page.goto('/onboarding');
		await page.fill('input[name="username"]', 'resumetest123');
		await page.click('button:text("Continue")');
		
		// Select account type
		await page.click('input[value="personal"]');
		await page.click('button:text("Continue")');
		
		// Fill profile partially
		await page.fill('input[name="fullName"]', 'Resume Test User');
		
		// Simulate page refresh/navigation away
		await page.reload();
		
		// Should resume from profile step with saved data
		await expect(page.locator('h2:text("Profile")')).toBeVisible();
		await expect(page.locator('input[name="fullName"]')).toHaveValue('Resume Test User');
	});

	test('Onboarding error handling', async ({ page }) => {
		// Mock server error for testing
		await page.route('**/onboarding?/saveStep', (route) => {
			route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Server error' })
			});
		});

		await page.goto('/onboarding');
		await page.fill('input[name="username"]', 'errortest123');
		await page.click('button:text("Continue")');
		
		// Should show error message
		await expect(page.locator('text=Failed to save progress')).toBeVisible();
		
		// Should stay on same step
		await expect(page.locator('h2:text("Username")')).toBeVisible();
	});

	test('Localized onboarding flow', async ({ page }) => {
		// Test Bulgarian localization
		await page.goto('/bg/onboarding');
		
		// Check that Bulgarian text is displayed
		// Note: This assumes translations exist
		await expect(page.locator('text=Настройте вашия профил')).toBeVisible();
		
		// Complete flow and verify redirect maintains locale
		await page.fill('input[name="username"]', 'bgtest123');
		await page.click('button:text("Продължи")');
		
		await page.click('input[value="personal"]');
		await page.click('button:text("Продължи")');
		
		await page.fill('input[name="fullName"]', 'BG Test User');
		await page.click('button:text("Продължи")');
		
		await page.click('button:text("Продължи")'); // Skip payment
		
		await page.click('button:text("Завърши")');
		
		// Should redirect to Bulgarian home page
		await expect(page).toHaveURL('/bg');
	});
});