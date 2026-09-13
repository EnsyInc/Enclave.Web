import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/licenses');
});

test('navigating via the Details menu item shows the license page and full breadcrumb', async ({
  page,
}) => {
  await page.getByPlaceholder('Search Licenses').pressSequentially('Northwind Systems');
  const scheduledRow = page.locator('tr[mat-row]', { hasText: 'Enclave Core' });
  // The actions button is `visibility: hidden` until the row is hovered/focused (license-list.scss).
  await scheduledRow.hover();
  await scheduledRow
    .getByRole('button', { name: 'Northwind Systems_Enclave Core actions' })
    .click();
  await page.getByRole('menuitem', { name: 'Details' }).click();

  await expect(page).toHaveURL('/admin/licenses/1?tab=info');
  await expect(page.locator('.title')).toHaveText('Enclave Core - Northwind Systems');

  const breadcrumb = page.locator('.breadcrumb');
  await expect(breadcrumb).toContainText('Enclave');
  await expect(breadcrumb).toContainText('Admin');
  await expect(breadcrumb).toContainText('Licenses');
  await expect(breadcrumb).toContainText('Enclave Core - Northwind Systems');
});

test('renders the resolved status in the header', async ({ page }) => {
  await page.goto('/admin/licenses/1');

  await expect(page.locator('enclave-details-header enclave-status')).toContainText('Scheduled');
});

test('renders the Info tab fields for the selected license', async ({ page }) => {
  await page.goto('/admin/licenses/1');

  const row = (label: string) =>
    page.locator('enclave-detail-row').filter({ hasText: label }).locator('.info-value');

  await expect(row('Product')).toHaveText('Enclave Core');
  await expect(row('Organization')).toHaveText('Northwind Systems');
  await expect(row('Status')).toContainText('Scheduled');
  await expect(row('Id')).toHaveText('1');
});

test.describe('time left indicator', () => {
  test('is hidden for a Scheduled license', async ({ page }) => {
    await page.goto('/admin/licenses/1');

    await expect(page.locator('enclave-time-left')).toHaveCount(0);
  });

  test('is shown for an Active license', async ({ page }) => {
    await page.goto('/admin/licenses/2');

    await expect(page.locator('enclave-time-left')).toBeVisible();
  });
});
