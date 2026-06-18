import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
};

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('guest is redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('valid login lands on dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in login form
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.click('[data-testid="login-button"]');

    // Wait for navigation and verify dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();

    // Verify auth state is persisted
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();
  });

  test('invalid login shows error message', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Verify error message appears
    const error = page.locator('[data-testid="login-error"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText(/invalid|error|incorrect/i);

    // Verify we stay on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('logout returns to login and blocks dashboard access', async ({ page }) => {
    // First, login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Logout
    await page.click('[data-testid="logout-button"]');
    await expect(page).toHaveURL(/.*login/);

    // Try to access dashboard again (should redirect to login)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);

    // Verify auth token is removed
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeFalsy();
  });
});
