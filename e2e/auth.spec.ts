import { test, expect } from '@playwright/test';
import { login, logout } from './helpers/auth';

test.describe('Auth Flow', () => {
  test('guest is redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('valid login lands on dashboard', async ({ page }) => {
    // Use test credentials or mock the auth
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('invalid login shows error message', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPass!');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('logout returns to login and blocks dashboard access', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Then logout
    await page.click('button[data-testid="logout-btn"]');
    await page.waitForURL('/login');
    
    // Try to access dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
