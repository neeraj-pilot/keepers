import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('should display the Keepers logo and title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Keepers' })).toBeVisible();
  });

  test('should display the tagline', async ({ page }) => {
    await expect(
      page.getByText('Split your secrets among people you trust')
    ).toBeVisible();
  });

  test('should have Create New Secret button', async ({ page }) => {
    const createButton = page.getByRole('link', { name: /Create New Secret/i });
    await expect(createButton).toBeVisible();
  });

  test('should have Recover Existing button', async ({ page }) => {
    const recoverButton = page.getByRole('link', { name: /Recover Existing/i });
    await expect(recoverButton).toBeVisible();
  });

  test('should navigate to create flow when clicking Create New Secret', async ({ page }) => {
    await page.getByRole('link', { name: /Create New Secret/i }).click();
    await expect(page).toHaveURL(/\/create/);
  });

  test('should navigate to recover flow when clicking Recover Existing', async ({ page }) => {
    await page.getByRole('link', { name: /Recover Existing/i }).click();
    await expect(page).toHaveURL(/\/recover/);
  });

  test('should display feature cards', async ({ page }) => {
    await expect(page.getByText('Split & Secure')).toBeVisible();
    await expect(page.getByText('Trusted Circle')).toBeVisible();
    await expect(page.getByText('Truly Private')).toBeVisible();
  });

  test('should display how it works section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
    await expect(page.getByText('Enter your secret')).toBeVisible();
    await expect(page.getByText('Add your trusted keepers')).toBeVisible();
  });

  test('should display security guarantees', async ({ page }) => {
    await expect(page.getByText('Security guarantees')).toBeVisible();
    await expect(page.getByText('No servers, no databases, no accounts')).toBeVisible();
  });

  test('should display footer privacy message', async ({ page }) => {
    await expect(
      page.getByText('Your secrets never leave your browser')
    ).toBeVisible();
  });
});
