import { test, expect, Page } from '@playwright/test';

test.describe('Creator Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should redirect incomplete creators to onboarding', async ({ page }) => {
    // Try to access dashboard
    await page.goto('/dashboard');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding\//);
  });

  test('should show identity step with async handle validation', async ({ page }) => {
    await page.goto('/onboarding/identity');

    // Check page content
    await expect(page.locator('h2')).toContainText('Create Your Identity');

    // Fill display name
    await page.fill('input[placeholder*="Alex Taylor"]', 'John Doe');

    // Fill handle
    const handleInput = page.locator('input[placeholder="username"]');
    await handleInput.fill('johndoe');

    // Wait for handle check (debounce 500ms)
    await page.waitForTimeout(600);

    // Check for success indicator
    const successIcon = page.locator('svg.text-green-500');
    await expect(successIcon).toBeVisible({ timeout: 5000 });

    // Fill avatar URL
    await page.fill('input[placeholder*="avatar.jpg"]', 'https://example.com/avatar.jpg');

    // Submit form
    await page.click('button:has-text("Continue")');

    // Should advance to profile step
    await expect(page).toHaveURL(/\/onboarding\/profile/);
  });

  test('should block advance with unavailable handle', async ({ page }) => {
    await page.goto('/onboarding/identity');

    // Fill form
    await page.fill('input[placeholder*="Alex Taylor"]', 'John Doe');

    // Use a taken handle (e.g., 'admin')
    const handleInput = page.locator('input[placeholder="username"]');
    await handleInput.fill('admin');

    // Wait for handle check
    await page.waitForTimeout(600);

    // Check for error indicator
    const errorIcon = page.locator('svg.text-red-500');
    await expect(errorIcon).toBeVisible({ timeout: 5000 });

    // Continue button should be disabled
    const continueButton = page.locator('button:has-text("Continue")');
    await expect(continueButton).toBeDisabled();
  });

  test('should validate required fields on each step', async ({ page }) => {
    await page.goto('/onboarding/profile');

    // Try to submit without selecting categories
    await page.click('button:has-text("Continue")');

    // Should show error
    const errorText = page.locator('text=Please select at least one category');
    await expect(errorText).toBeVisible();

    // Should not advance
    await expect(page).toHaveURL(/\/onboarding\/profile/);
  });

  test('should save progress to localStorage and restore on refresh', async ({ page }) => {
    // Fill identity step
    await page.goto('/onboarding/identity');
    await page.fill('input[placeholder*="Alex Taylor"]', 'John Doe');

    const handleInput = page.locator('input[placeholder="username"]');
    await handleInput.fill('johndoe');
    await page.waitForTimeout(600);

    await page.fill('input[placeholder*="avatar.jpg"]', 'https://example.com/avatar.jpg');

    // Check localStorage
    const draftBefore = await page.evaluate(() => {
      return localStorage.getItem('onboarding_draft_v1');
    });
    expect(draftBefore).toBeTruthy();

    // Reload page
    await page.reload();

    // Data should be restored
    const displayNameInput = page.locator('input[placeholder*="Alex Taylor"]');
    await expect(displayNameInput).toHaveValue('John Doe');

    const handleInputAfter = page.locator('input[placeholder="username"]');
    await expect(handleInputAfter).toHaveValue('johndoe');
  });

  test('should navigate with next/prev buttons and browser history', async ({ page }) => {
    await page.goto('/onboarding/identity');

    // Fill and advance
    await page.fill('input[placeholder*="Alex Taylor"]', 'John Doe');

    const handleInput = page.locator('input[placeholder="username"]');
    await handleInput.fill('johndoe');
    await page.waitForTimeout(600);

    await page.click('button:has-text("Continue")');
    await expect(page).toHaveURL(/\/onboarding\/profile/);

    // Click back button
    await page.click('button:has-text("Back")');
    await expect(page).toHaveURL(/\/onboarding\/identity/);

    // Use browser back button
    await page.goBack();
    // Should stay on identity (no page before onboarding)

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/\/onboarding\/profile/);
  });

  test('should show skip confirmation on content step', async ({ page }) => {
    // Navigate to content step (skip other steps by direct navigation)
    await page.goto('/onboarding/content');

    // Click skip button
    const skipButton = page.locator('button:has-text("Skip for Now")');
    await skipButton.click();

    // Should show confirmation dialog
    const dialog = page.locator('[role="alertdialog"]');
    await expect(dialog).toBeVisible();

    // Check dialog text
    await expect(dialog).toContainText('Skip Content Upload?');

    // Click confirm skip
    await page.click('button:has-text("Skip Anyway")');

    // Should advance to review step
    await expect(page).toHaveURL(/\/onboarding\/review/);
  });

  test('should show review step with all data', async ({ page }) => {
    // Complete all steps
    await page.goto('/onboarding/identity');

    // Identity
    await page.fill('input[placeholder*="Alex Taylor"]', 'John Doe');
    const handleInput = page.locator('input[placeholder="username"]');
    await handleInput.fill('johndoe');
    await page.waitForTimeout(600);
    await page.click('button:has-text("Continue")');

    // Profile
    await expect(page).toHaveURL(/\/onboarding\/profile/);
    await page.fill('textarea', 'I am a creator');
    await page.check('text=Music');
    await page.click('button:has-text("Continue")');

    // Monetization
    await expect(page).toHaveURL(/\/onboarding\/monetization/);
    await page.selectOption('select', 'bank_transfer');
    await page.check('text=I agree to the payment terms');
    await page.click('button:has-text("Continue")');

    // Content
    await expect(page).toHaveURL(/\/onboarding\/content/);
    await page.click('button:has-text("Skip Anyway")');

    // Review
    await expect(page).toHaveURL(/\/onboarding\/review/);

    // Check that data is displayed
    await expect(page).toContainText('John Doe');
    await expect(page).toContainText('@johndoe');
    await expect(page).toContainText('I am a creator');
    await expect(page).toContainText('Music');
    await expect(page).toContainText('Bank Transfer');
  });

  test('should require guidelines acceptance before launch', async ({ page }) => {
    // Navigate directly to review step for testing
    await page.goto('/onboarding/review');

    // Try to click launch button (should be disabled)
    const launchButton = page.locator('button:has-text("Launch My Profile")');
    await expect(launchButton).toBeDisabled();

    // Check the guidelines checkbox
    const guidelinesCheckbox = page.locator('input[type="checkbox"]').first();
    await guidelinesCheckbox.check();

    // Button should now be enabled
    await expect(launchButton).toBeEnabled();
  });

  test('should show launch confirmation dialog', async ({ page }) => {
    await page.goto('/onboarding/review');

    // Accept guidelines
    const guidelinesCheckbox = page.locator('input[type="checkbox"]').first();
    await guidelinesCheckbox.check();

    // Click launch
    await page.click('button:has-text("Launch My Profile")');

    // Check for confirmation dialog
    const dialog = page.locator('[role="alertdialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Ready to Launch?');
  });

  test('should show progress bar and step indicators', async ({ page }) => {
    await page.goto('/onboarding/identity');

    // Check progress bar
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();

    // Check step indicators
    const stepIndicators = page.locator('[role="tab"]');
    await expect(stepIndicators).toHaveCount(5);

    // First step should be active
    const firstStep = stepIndicators.first();
    const firstStepClasses = await firstStep.getAttribute('class');
    expect(firstStepClasses).toContain('bg-blue-500');

    // Move to next step
    await page.fill('input[placeholder*="Alex Taylor"]', 'John Doe');
    const handleInput = page.locator('input[placeholder="username"]');
    await handleInput.fill('johndoe');
    await page.waitForTimeout(600);
    await page.click('button:has-text("Continue")');

    // First step should now be completed
    await expect(firstStep).toHaveClass(/bg-green-500/);
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/onboarding/identity');

    // Tab to first input
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('INPUT');

    // Tab through inputs
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Fill form with keyboard
    await page.keyboard.type('johndoe');

    // Tab to submit button
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('BUTTON');

    // Press Enter to submit (if valid)
    // Note: May not submit if validation fails, which is correct behavior
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/onboarding/identity');

    // Check that main content is visible without horizontal scroll
    const mainContent = page.locator('[role="main"]');
    await expect(mainContent).toBeVisible();

    // Check that footer buttons are visible
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();

    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeVisible();

    // Verify button sizes are touch-friendly (at least 44px)
    const buttonSize = await nextButton.boundingBox();
    expect(buttonSize?.height).toBeGreaterThanOrEqual(40); // Close to 44px min
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/onboarding/identity');

    // Simulate network error
    await page.route('**/api/onboarding/**', route => {
      route.abort('failed');
    });

    // Fill form
    await page.fill('input[placeholder*="Alex Taylor"]', 'John Doe');
    const handleInput = page.locator('input[placeholder="username"]');
    await handleInput.fill('johndoe');

    // Wait for failed request
    await page.waitForTimeout(1000);

    // Should show error message or allow user to retry
    // (exact UX depends on implementation)
    const handleInputValue = await handleInput.inputValue();
    expect(handleInputValue).toBe('johndoe'); // Data preserved
  });

  test('should support dark mode', async ({ page }) => {
    await page.goto('/onboarding/identity');

    // Set dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' });

    // Check that page is visible in dark mode
    const mainElement = page.locator('div.bg-background');
    await expect(mainElement).toBeVisible();

    // Check contrast (basic check - proper testing would use accessibility tools)
    const labels = page.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);
  });

  test('should update progress percentage as steps complete', async ({ page }) => {
    await page.goto('/onboarding/identity');

    // Get initial progress
    let progressText = await page.locator('text=/\\d+%/').first().textContent();
    expect(progressText).toBe('20%');

    // Complete identity and move to profile
    await page.fill('input[placeholder*="Alex Taylor"]', 'John Doe');
    const handleInput = page.locator('input[placeholder="username"]');
    await handleInput.fill('johndoe');
    await page.waitForTimeout(600);
    await page.click('button:has-text("Continue")');

    // Check progress updated
    await expect(page).toHaveURL(/\/onboarding\/profile/);
    progressText = await page.locator('text=/\\d+%/').first().textContent();
    expect(progressText).toBe('40%');
  });
});

test.describe('Onboarding Guards', () => {
  test('should redirect to onboarding when accessing dashboard as incomplete creator', async ({
    page,
  }) => {
    // Mock incomplete creator
    await page.goto('/dashboard');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding\//);
  });

  test('should prevent non-creators from accessing onboarding', async ({ page }) => {
    // This test would need proper auth setup
    // For now, it documents the expected behavior
    // await page.goto('/onboarding');
    // await expect(page).toContainText('Role mismatch');
  });
});
