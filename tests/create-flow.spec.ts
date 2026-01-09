import { test, expect } from '@playwright/test';

test.describe('Create Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('create');
    // Wait for the page to load
    await page.waitForSelector('h2');
  });

  test('should display step 1 - About You', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'About You' })).toBeVisible();
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel(/Your contact info/)).toBeVisible();
  });

  test('should not allow proceeding without name', async ({ page }) => {
    const continueButton = page.getByRole('button', { name: /Continue/i });
    await expect(continueButton).toBeDisabled();
  });

  test('should allow proceeding after entering name', async ({ page }) => {
    await page.getByLabel('Your name').fill('John Doe');
    const continueButton = page.getByRole('button', { name: /Continue/i });
    await expect(continueButton).toBeEnabled();
  });

  test('should navigate through all steps', async ({ page }) => {
    // Step 1: About You
    await page.getByLabel('Your name').fill('John Doe');
    await page.getByLabel(/Your contact info/).fill('john@example.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Your Secret (using valid BIP39 words for Ente.io Recovery Key)
    await expect(page.getByRole('heading', { name: 'Your Secret' })).toBeVisible();
    await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Your Keepers
    await expect(page.getByRole('heading', { name: 'Your Keepers' })).toBeVisible();

    // Fill in keeper details using placeholder text
    const keeperInputs = page.locator('input[placeholder*="Mom"]');
    await keeperInputs.first().fill('Mom');

    // Get all name inputs and fill them
    const nameInputs = page.locator('input[id$="-name"]');
    const count = await nameInputs.count();
    for (let i = 0; i < count; i++) {
      const input = nameInputs.nth(i);
      const value = await input.inputValue();
      if (!value) {
        await input.fill(['Mom', 'Dad', 'Sister'][i] || `Keeper ${i + 1}`);
      }
    }

    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4: Message to Keepers
    await expect(page.getByRole('heading', { name: 'Message to Keepers' })).toBeVisible();
    await page.getByPlaceholder(/Write a message/).fill('Please help recover my secret if needed.');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5: Review
    await expect(page.getByRole('heading', { name: 'Review & Generate' })).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
  });

  test('should go back to previous step', async ({ page }) => {
    await page.getByLabel('Your name').fill('John Doe');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Your Secret' })).toBeVisible();

    await page.getByRole('button', { name: /Back/i }).click();
    await expect(page.getByRole('heading', { name: 'About You' })).toBeVisible();
  });

  test('should show secret type dropdown', async ({ page }) => {
    await page.getByLabel('Your name').fill('John Doe');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Click on the select trigger
    await page.getByRole('combobox').click();

    // Check that at least one dropdown option is visible (Ente.io Recovery Key is now first)
    await expect(page.getByText(/Ente.io Recovery Key/i)).toBeVisible();
  });

  test('should toggle secret visibility', async ({ page }) => {
    await page.getByLabel('Your name').fill('John Doe');
    await page.getByRole('button', { name: /Continue/i }).click();

    const showButton = page.getByRole('button', { name: /Show/i });
    await expect(showButton).toBeVisible();

    await showButton.click();
    await expect(page.getByRole('button', { name: /Hide/i })).toBeVisible();
  });

  test('should select threshold option', async ({ page }) => {
    await page.getByLabel('Your name').fill('John Doe');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByPlaceholder(/Enter your seed phrase/).fill('secret');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Find and click threshold option
    const thresholdOption = page.getByRole('button', { name: /Any 2 of 3/i });
    await expect(thresholdOption).toBeVisible();
  });

  test('should use message template', async ({ page }) => {
    await page.getByLabel('Your name').fill('John Doe');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByPlaceholder(/Enter your seed phrase/).fill('secret');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for step 3 heading
    await expect(page.getByRole('heading', { name: 'Your Keepers' })).toBeVisible();

    // Fill keepers using Label locator
    await page.getByLabel('Name').nth(0).fill('Mom');
    await page.getByLabel('Name').nth(1).fill('Dad');
    await page.getByLabel('Name').nth(2).fill('Sister');

    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for step 4 heading
    await expect(page.getByRole('heading', { name: 'Message to Keepers' })).toBeVisible();

    // Click use template
    await page.getByText('Use suggested template').click();

    const messageArea = page.getByPlaceholder(/Write a message/);
    await expect(messageArea).not.toBeEmpty();
  });
});

test.describe('Create Flow - Generate and Download', () => {
  test('should generate documents and show download options', async ({ page }) => {
    await page.goto('create');
    await page.waitForSelector('h2');

    // Step 1
    await page.getByLabel('Your name').fill('Test User');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2
    await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3
    const nameInputs = page.locator('input[id$="-name"]');
    await nameInputs.nth(0).fill('Keeper One');
    await nameInputs.nth(1).fill('Keeper Two');
    await nameInputs.nth(2).fill('Keeper Three');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5 - Review
    await expect(page.getByRole('heading', { name: 'Review & Generate' })).toBeVisible();
    await page.getByRole('button', { name: /Generate Documents/i }).click();

    // Step 6 - Download
    await expect(page.getByText(/Documents Ready/i)).toBeVisible();
    await expect(page.getByText("Keeper One's Document")).toBeVisible();
    await expect(page.getByText("Keeper Two's Document")).toBeVisible();
    await expect(page.getByText("Keeper Three's Document")).toBeVisible();
    await expect(page.getByRole('button', { name: /Download All as ZIP/i })).toBeVisible();
  });

  test('should navigate to test recovery step', async ({ page }) => {
    await page.goto('create');
    await page.waitForSelector('h2');

    // Quick flow through
    await page.getByLabel('Your name').fill('Test User');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    await page.getByRole('button', { name: /Continue/i }).click();

    const nameInputs = page.locator('input[id$="-name"]');
    await nameInputs.nth(0).fill('A');
    await nameInputs.nth(1).fill('B');
    await nameInputs.nth(2).fill('C');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /Generate Documents/i }).click();

    // Step 6 - Download
    await expect(page.getByText(/Documents Ready/i)).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 7 - Verify
    await expect(page.getByRole('heading', { name: 'Verify Your Setup' })).toBeVisible();
  });

  test('should test recovery in verification step', async ({ page }) => {
    await page.goto('create');
    await page.waitForSelector('h2');

    // Quick flow through
    await page.getByLabel('Your name').fill('Test User');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByPlaceholder(/Enter your seed phrase/).fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    await page.getByRole('button', { name: /Continue/i }).click();

    const nameInputs2 = page.locator('input[id$="-name"]');
    await nameInputs2.nth(0).fill('Alice');
    await nameInputs2.nth(1).fill('Bob');
    await nameInputs2.nth(2).fill('Carol');
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /Generate Documents/i }).click();

    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 7 - Verify
    await expect(page.getByRole('heading', { name: 'Verify Your Setup' })).toBeVisible();

    // Select 2 pieces
    await page.getByRole('button', { name: /Alice's piece/i }).click();
    await page.getByRole('button', { name: /Bob's piece/i }).click();

    // Test recovery
    await page.getByRole('button', { name: 'Test Recovery' }).click();

    // Should show success
    await expect(page.getByText('Recovery Successful')).toBeVisible();
  });
});
