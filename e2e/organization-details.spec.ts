import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/organizations');
});

test('clicking an organization row shows the organization page and full breadcrumb', async ({
  page,
}) => {
  await page.locator('tr[mat-row]', { hasText: 'Northwind Systems' }).click();

  await expect(page).toHaveURL('/admin/organizations/1');
  await expect(page.locator('.title')).toHaveText('Northwind Systems');

  const breadcrumb = page.locator('.breadcrumb');
  await expect(breadcrumb).toContainText('Enclave');
  await expect(breadcrumb).toContainText('Admin');
  await expect(breadcrumb).toContainText('Organizations');
  await expect(breadcrumb).toContainText('Northwind Systems');
});

test('renders the resolved status and primary contact email in the header', async ({ page }) => {
  await page.goto('/admin/organizations/1');

  await expect(page.locator('enclave-status')).toContainText('Active');
  await expect(page.locator('.subtitle')).toContainText('ops@northwind.io');
});
