import { test, expect } from '@playwright/test';

test.describe('New Features', () => {
  test.describe('Keeper Count Chips', () => {
    test('should display keeper count chips in step 3', async ({ page }) => {
      await page.goto('create');
      await page.waitForSelector('h2');

      // Step 1
      await page.getByLabel('Your name').fill('Test User');
      await page.getByRole('button', { name: /Continue/i }).click();

      // Step 2
      await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      await page.getByRole('button', { name: /Continue/i }).click();

      // Step 3 - Should see keeper count chips
      await expect(page.getByText('3 keepers')).toBeVisible();
      await expect(page.getByText('5 keepers')).toBeVisible();
      await expect(page.getByText('7 keepers')).toBeVisible();
    });

    test('should change keeper count when clicking chip', async ({ page }) => {
      await page.goto('create');
      await page.waitForSelector('h2');

      // Navigate to step 3
      await page.getByLabel('Your name').fill('Test User');
      await page.getByRole('button', { name: /Continue/i }).click();
      await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      await page.getByRole('button', { name: /Continue/i }).click();

      // Initially 3 keepers (3 keeper cards)
      await expect(page.locator('input[id$="-name"]')).toHaveCount(3);

      // Click on 5 keepers chip
      await page.getByText('5 keepers').click();

      // Should now have 5 keeper cards
      await expect(page.locator('input[id$="-name"]')).toHaveCount(5);
    });
  });

  test.describe('Custom Secret Type', () => {
    test('should show custom input when Other is selected', async ({ page }) => {
      await page.goto('create');
      await page.waitForSelector('h2');

      // Step 1
      await page.getByLabel('Your name').fill('Test User');
      await page.getByRole('button', { name: /Continue/i }).click();

      // Step 2 - Select "Other" - click the secret type combobox (not the header language selector)
      // The secret type selector has "Ente.io Recovery Key" as default text
      const secretTypeSelect = page.locator('[data-slot="select-trigger"]').filter({ hasText: /Ente.io Recovery Key/i });
      await secretTypeSelect.click();
      await page.getByRole('option', { name: /Other/i }).click();

      // Custom input should appear
      await expect(page.getByPlaceholder(/Bank account details/i)).toBeVisible();
    });

    test('should allow entering custom secret type', async ({ page }) => {
      await page.goto('create');
      await page.waitForSelector('h2');

      // Step 1
      await page.getByLabel('Your name').fill('Test User');
      await page.getByRole('button', { name: /Continue/i }).click();

      // Step 2 - Select "Other" and enter custom type
      const secretTypeSelect = page.locator('[data-slot="select-trigger"]').filter({ hasText: /Ente.io Recovery Key/i });
      await secretTypeSelect.click();
      await page.getByRole('option', { name: /Other/i }).click();
      await page.getByPlaceholder(/Bank account details/i).fill('My Custom Secret Type');

      // Should be able to continue
      await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      await expect(page.getByRole('button', { name: /Continue/i })).toBeEnabled();
    });
  });

  test.describe('Per-Keeper Language Selection', () => {
    test('should show language selector for each keeper', async ({ page }) => {
      await page.goto('create');
      await page.waitForSelector('h2');

      // Navigate to step 3
      await page.getByLabel('Your name').fill('Test User');
      await page.getByRole('button', { name: /Continue/i }).click();
      await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      await page.getByRole('button', { name: /Continue/i }).click();

      // Should see language selectors - there's also one in the header, so we have 4 (1 header + 3 keepers)
      const languageSelectors = page.locator('button:has(.lucide-globe)');
      await expect(languageSelectors).toHaveCount(4); // 1 header + 3 keepers
    });

    test('should allow changing keeper language', async ({ page }) => {
      await page.goto('create');
      await page.waitForSelector('h2');

      // Navigate to step 3
      await page.getByLabel('Your name').fill('Test User');
      await page.getByRole('button', { name: /Continue/i }).click();
      await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      await page.getByRole('button', { name: /Continue/i }).click();

      // Click on the second language selector (first one is in header, second is first keeper)
      const keeperLanguageSelector = page.locator('button:has(.lucide-globe)').nth(1);
      await keeperLanguageSelector.click();

      // Select Spanish
      await page.getByRole('option', { name: 'Español' }).click();

      // Language should be changed
      await expect(keeperLanguageSelector).toContainText('Español');
    });
  });
});

test.describe('i18n Features', () => {
  test('should display language selector in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    // Look for the language selector (Globe icon)
    await expect(page.locator('.lucide-globe').first()).toBeVisible();
  });

  test('should change UI language when selecting different language', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1');

    // Click on language selector
    const languageSelector = page.locator('button:has(.lucide-globe)').first();
    await languageSelector.click();

    // Select Spanish
    await page.getByRole('option', { name: 'Español' }).click();

    // UI should update to Spanish - check for Spanish text
    // Wait a moment for the language change to take effect
    await page.waitForTimeout(500);

    // The "Create New Secret" button should now be in Spanish (lowercase "secreto")
    await expect(page.getByRole('link', { name: /Crear nuevo secreto/i })).toBeVisible();
  });
});
