import { expect, test } from '@playwright/test';

test('redirects an unmatched URL to the not-found page', async ({ page }) => {
  await page.goto('/this/route/does/not/exist');

  await expect(page).toHaveURL('/not-found');
  await expect(page.getByRole('heading', { name: 'Page not found :(' })).toBeVisible();
});

test('redirects an unknown product id to the not-found page', async ({ page }) => {
  await page.goto('/admin/products/does-not-exist');

  await expect(page).toHaveURL('/not-found');
  await expect(page.getByRole('heading', { name: 'Page not found :(' })).toBeVisible();
});
