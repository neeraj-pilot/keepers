import { test, expect } from '@playwright/test';

test.describe('Recover Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('recover');
    await page.waitForSelector('h2');
  });

  test('should display recover page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recover a Secret' })).toBeVisible();
  });

  test('should display input field for piece', async ({ page }) => {
    await expect(
      page.getByPlaceholder(/Paste or type the code/i)
    ).toBeVisible();
  });

  test('should show disabled recover button initially', async ({ page }) => {
    // Initially should show "Need 2 more pieces"
    await expect(page.getByText(/Need \d+ more piece/i)).toBeVisible();
  });

  test('should show error for invalid piece format', async ({ page }) => {
    await page.getByPlaceholder(/Paste or type the code/i).fill('invalid-piece');
    await page.locator('button:has(svg)').first().click(); // Click + button

    // Error message should be visible - look for the destructive alert wrapper
    // The AnimatePresence wrapper may add an intermediate div
    const errorAlert = page.locator('.bg-destructive, [class*="destructive"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 7000 });
  });

  test('should show help text', async ({ page }) => {
    await expect(
      page.getByText(/Need help\?/i)
    ).toBeVisible();
  });
});

test.describe('Recover Flow - Full Integration', () => {
  test('should recover secret with valid pieces', async ({ page }) => {
    // First, create a secret and get the shares
    await page.goto('create');
    await page.waitForSelector('h2');

    // Step 1
    await page.getByLabel('Your name').fill('Recovery Test');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2 - Use valid BIP39 words for Ente.io Recovery Key
    const testSecret = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    await page.getByPlaceholder(/Enter your seed phrase/).fill(testSecret);
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3 - Add keepers
    const nameInputs = page.locator('input[id$="-name"]');
    await nameInputs.nth(0).fill('Keeper A');
    await nameInputs.nth(1).fill('Keeper B');
    await nameInputs.nth(2).fill('Keeper C');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4 - Skip message
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5 - Generate
    await page.getByRole('button', { name: /Generate Documents/i }).click();

    // Step 6 - Go to verify
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 7 - Test recovery works
    await page.getByRole('button', { name: /Keeper A's piece/i }).click();
    await page.getByRole('button', { name: /Keeper B's piece/i }).click();
    await page.getByRole('button', { name: 'Test Recovery' }).click();

    // Verify success
    await expect(page.getByText('Recovery Successful')).toBeVisible();

    // Verify the recovered secret matches (partial check for BIP39 words)
    await expect(page.getByText(/abandon abandon/)).toBeVisible();
  });
});

test.describe('Recover Flow - UI', () => {
  test('should display add piece input', async ({ page }) => {
    await page.goto('recover');
    await page.waitForSelector('h2');

    await expect(page.getByPlaceholder(/Paste or type the code/i)).toBeVisible();
  });

  test('should show initial state message', async ({ page }) => {
    await page.goto('recover');
    await page.waitForSelector('h2');

    // Initially should show some indication about needing pieces (text varies based on translation)
    await expect(page.getByRole('button', { name: /Need 2 more piece/i })).toBeVisible();
  });
});
