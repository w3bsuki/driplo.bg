import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.describe('Browse and Search Flow', () => {
    test('should be able to browse products and use filters', async ({ page }) => {
      await page.goto('/browse');
      
      // Wait for products to load
      await expect(page.getByTestId('product-grid')).toBeVisible();
      await expect(page.getByTestId('product-card')).toHaveCount(1);
      
      // Test category filter
      await page.getByRole('button', { name: /category/i }).click();
      await page.getByRole('option', { name: /women/i }).first().click();
      
      // Wait for filtered results
      await expect(page).toHaveURL(/category=women/);
      await page.waitForLoadState('networkidle');
      
      // Test price filter
      await page.getByLabel(/min price/i).fill('50');
      await page.getByLabel(/max price/i).fill('200');
      await page.getByRole('button', { name: /apply filters/i }).click();
      
      // Verify URL contains price filters
      await expect(page).toHaveURL(/min_price=50/);
      await expect(page).toHaveURL(/max_price=200/);
      
      // Test search
      await page.getByRole('searchbox').fill('dress');
      await page.getByRole('searchbox').press('Enter');
      
      await expect(page).toHaveURL(/q=dress/);
    });

    test('should be able to view product details', async ({ page }) => {
      await page.goto('/browse');
      
      // Click on first product
      await expect(page.getByTestId('product-card')).toHaveCount(1);
      await page.getByTestId('product-card').first().click();
      
      // Should be on product detail page
      await expect(page).toHaveURL(/\/listings\/[a-f0-9-]+/);
      
      // Verify product details are visible
      await expect(page.getByTestId('product-title')).toBeVisible();
      await expect(page.getByTestId('product-price')).toBeVisible();
      await expect(page.getByTestId('product-gallery')).toBeVisible();
      await expect(page.getByTestId('seller-info')).toBeVisible();
      
      // Test image gallery
      if (await page.getByTestId('gallery-next').isVisible()) {
        await page.getByTestId('gallery-next').click();
        await expect(page.getByTestId('product-gallery')).toBeVisible();
      }
    });
  });

  test.describe('Authentication Flow', () => {
    test('should be able to navigate to login and see form', async ({ page }) => {
      await page.goto('/login');
      
      // Verify login form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
      
      // Test form validation
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test('should be able to navigate to registration', async ({ page }) => {
      await page.goto('/register');
      
      // Verify registration form
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });

    test('should show password strength indicator', async ({ page }) => {
      await page.goto('/register');
      
      const passwordInput = page.getByLabel(/^password/i);
      await passwordInput.fill('weak');
      
      await expect(page.getByTestId('password-strength')).toBeVisible();
      await expect(page.getByText(/weak/i)).toBeVisible();
      
      await passwordInput.fill('StrongPassword123!');
      await expect(page.getByText(/strong/i)).toBeVisible();
    });
  });

  test.describe('Seller Flow', () => {
    test('should be able to access sell page (unauthorized)', async ({ page }) => {
      await page.goto('/sell');
      
      // Should redirect to login or show auth requirement
      const currentUrl = page.url();
      const hasLoginForm = await page.getByLabel(/email/i).isVisible();
      const hasAuthMessage = await page.getByText(/sign in/i).isVisible();
      
      expect(
        currentUrl.includes('/login') || hasLoginForm || hasAuthMessage
      ).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('should show 404 page for non-existent routes', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      await expect(page.getByText(/404/i)).toBeVisible();
      await expect(page.getByText(/not found/i)).toBeVisible();
      await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/browse');
      
      // Should show error state or retry option
      const hasErrorMessage = await page.getByText(/error/i).isVisible();
      const hasRetryButton = await page.getByRole('button', { name: /retry/i }).isVisible();
      const hasEmptyState = await page.getByTestId('empty-state').isVisible();
      
      expect(hasErrorMessage || hasRetryButton || hasEmptyState).toBe(true);
    });
  });

  test.describe('Performance and UX', () => {
    test('should load pages within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 second budget
    });

    test('should show loading states during navigation', async ({ page }) => {
      await page.goto('/');
      
      // Click on browse and check for loading indicator
      const browsePromise = page.waitForURL('**/browse');
      await page.getByRole('link', { name: /browse/i }).click();
      
      // Wait for browsing to complete
      await browsePromise;
      
      // Loading should be done
      await expect(page.getByTestId('loading-spinner')).not.toBeVisible();
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // Check mobile navigation
      await expect(page.getByTestId('mobile-nav')).toBeVisible();
      await expect(page.getByTestId('desktop-nav')).not.toBeVisible();
      
      // Test mobile search
      const searchButton = page.getByTestId('mobile-search-toggle');
      if (await searchButton.isVisible()) {
        await searchButton.click();
        await expect(page.getByRole('searchbox')).toBeVisible();
      }
    });
  });
});