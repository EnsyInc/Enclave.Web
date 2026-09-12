import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/licenses');
});

test('shows the active license count for the default set', async ({ page }) => {
  await expect(page.getByText('5 active')).toBeVisible();
  await expect(page.locator('tr[mat-row]')).toHaveCount(13);
});

test('filters the table to rows matching the search term', async ({ page }) => {
  await page.getByPlaceholder('Search Licenses').pressSequentially('Ridgeline Group');

  await expect(page.locator('tr[mat-row]')).toHaveCount(2);
  await expect(page.locator('tr[mat-row]')).toContainText(['Ridgeline Group', 'Ridgeline Group']);
});

test('shows a message naming the search term when nothing matches', async ({ page }) => {
  await page.getByPlaceholder('Search Licenses').pressSequentially('does-not-exist');

  await expect(page.locator('tr[mat-row]')).toHaveCount(0);
  await expect(page.getByText('No data matching the search term "does-not-exist".')).toBeVisible();
});

test('clearing the search restores every row', async ({ page }) => {
  const search = page.getByPlaceholder('Search Licenses');
  await search.pressSequentially('Ridgeline Group');
  await expect(page.locator('tr[mat-row]')).toHaveCount(2);

  await search.press('Control+A');
  await search.press('Backspace');

  await expect(page.locator('tr[mat-row]')).toHaveCount(13);
});

test('sorts rows by organization when the Organization column header is clicked', async ({
  page,
}) => {
  await page.getByRole('columnheader', { name: 'Organization' }).click();

  await expect(page.locator('tr[mat-row]').first()).toContainText('Castille & Co');
});

test('persists the sort across a reload via the URL', async ({ page }) => {
  await page.getByRole('columnheader', { name: 'Organization' }).click();
  await expect(page).toHaveURL(/sort=organization:asc/);

  await page.reload();

  await expect(page.locator('tr[mat-row]').first()).toContainText('Castille & Co');
});

test('hides the expiry date and time-left widget for a Scheduled license', async ({ page }) => {
  await page.getByPlaceholder('Search Licenses').pressSequentially('Northwind Systems');

  const scheduledRow = page.locator('tr[mat-row]', { hasText: 'Enclave Core' });
  await expect(scheduledRow.locator('.license-expiry-date')).toHaveText('-');
  await expect(scheduledRow.locator('.license-time-left')).toHaveText('-');
});

test('shows a real expiry date and the time-left widget for an Active license', async ({
  page,
}) => {
  await page.getByPlaceholder('Search Licenses').pressSequentially('Northwind Systems');

  const activeRow = page.locator('tr[mat-row]', { hasText: 'Vault Analytics' });
  await expect(activeRow.locator('.license-expiry-date')).not.toHaveText('-');
  await expect(activeRow.locator('mat-progress-bar')).toBeVisible();
});

test('clicking an organization name navigates to its details page', async ({ page }) => {
  await page.getByPlaceholder('Search Licenses').pressSequentially('Northwind Systems');

  await page.getByRole('link', { name: 'Northwind Systems' }).first().click();

  await expect(page).toHaveURL('/admin/organizations/1?tab=info');
});

test('clicking a product name navigates to its details page', async ({ page }) => {
  await page.getByPlaceholder('Search Licenses').pressSequentially('Northwind Systems');

  await page.getByRole('link', { name: 'Enclave Core' }).click();

  await expect(page).toHaveURL('/admin/products/1?tab=info');
});
