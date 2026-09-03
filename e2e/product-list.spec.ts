import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/products');
});

test('shows the total and active product counts for the default catalogue', async ({ page }) => {
  await expect(page.getByText('6 in the catalogue - 3 active')).toBeVisible();
  await expect(page.locator('tr[mat-row]')).toHaveCount(6);
});

test('filters the table to rows matching the search term', async ({ page }) => {
  await page.getByPlaceholder('Search Products').pressSequentially('Vault');

  await expect(page.locator('tr[mat-row]')).toHaveCount(1);
  await expect(page.locator('tr[mat-row]')).toContainText('Vault Analytics');
});

test('shows a message naming the search term when nothing matches', async ({ page }) => {
  await page.getByPlaceholder('Search Products').pressSequentially('does-not-exist');

  await expect(page.locator('tr[mat-row]')).toHaveCount(0);
  await expect(page.getByText('No data matching the search term "does-not-exist".')).toBeVisible();
});

test('clearing the search restores every row', async ({ page }) => {
  const search = page.getByPlaceholder('Search Products');
  await search.pressSequentially('Vault');
  await expect(page.locator('tr[mat-row]')).toHaveCount(1);

  await search.press('Control+A');
  await search.press('Backspace');

  await expect(page.locator('tr[mat-row]')).toHaveCount(6);
});

test('sorts rows by name when the Name column header is clicked', async ({ page }) => {
  await page.getByRole('columnheader', { name: 'Name' }).click();

  await expect(page.locator('tr[mat-row]').first()).toContainText('Beacon Alerts');
});
