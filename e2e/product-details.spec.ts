import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/products');
});

test('navigating via the product name shows the product page and full breadcrumb', async ({
  page,
}) => {
  await page.getByRole('link', { name: 'Enclave Core' }).click();

  await expect(page).toHaveURL('/admin/products/1');
  await expect(page.locator('.product-name')).toHaveText('Enclave Core');

  const breadcrumb = page.locator('.breadcrumb');
  await expect(breadcrumb).toContainText('Enclave');
  await expect(breadcrumb).toContainText('Admin');
  await expect(breadcrumb).toContainText('Products');
  await expect(breadcrumb).toContainText('Enclave Core');
});

test('renders the Info tab fields for the selected product', async ({ page }) => {
  await page.goto('/admin/products/1');

  const row = (label: string) =>
    page.locator('.product-info > div').filter({ hasText: label }).locator('.info-value');

  await expect(row('Name')).toHaveText('Enclave Core');
  await expect(row('Description')).toHaveText(
    'Seat-based license engine with entitlement checks and offline grace periods.',
  );
  await expect(row('Status')).toContainText('Active');
  await expect(row('Id')).toHaveText('1');
});

test('opens the edit dialog pre-filled from the product page', async ({ page }) => {
  await page.goto('/admin/products/1');

  await page.getByRole('button', { name: 'Edit' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Edit Product')).toBeVisible();
  await expect(dialog.getByLabel('Name')).toHaveValue('Enclave Core');
  await expect(dialog.getByLabel('Description')).toHaveValue(
    'Seat-based license engine with entitlement checks and offline grace periods.',
  );
});
