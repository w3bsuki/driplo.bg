import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  // Configure for consistent screenshots
  test.use({ 
    viewport: { width: 1280, height: 720 }
  });

  test('homepage should match visual baseline', async ({ page }) => {
    await page.goto('/');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content that changes
    await page.addStyleTag({
      content: `
        [data-testid="user-avatar"],
        [data-testid="notification-count"],
        [data-testid="live-count"] {
          visibility: hidden !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('browse page should match visual baseline', async ({ page }) => {
    await page.goto('/browse');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="product-grid"]', { timeout: 10000 });
    
    await expect(page).toHaveScreenshot('browse-page.png');
  });

  test('login page should match visual baseline', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveScreenshot('login-page.png');
  });

  test('mobile homepage should match visual baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content
    await page.addStyleTag({
      content: `
        [data-testid="user-avatar"],
        [data-testid="notification-count"] {
          visibility: hidden !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('mobile-homepage.png');
  });

  test('mobile browse page should match visual baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/browse');
    
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="product-grid"]', { timeout: 10000 });
    
    await expect(page).toHaveScreenshot('mobile-browse.png');
  });

  test('error pages should match visual baseline', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page).toHaveScreenshot('404-page.png');
  });

  test('should handle loading states consistently', async ({ page }) => {
    // Test loading state by blocking network
    await page.route('**/api/**', route => {
      // Delay API responses to capture loading states
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto('/browse');
    
    // Capture loading state
    await expect(page.getByTestId('loading-spinner')).toBeVisible();
    await expect(page).toHaveScreenshot('browse-loading.png');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('loading-spinner')).not.toBeVisible();
  });
});