import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/organizations');
});

test('clicking an organization row shows the organization page and full breadcrumb', async ({
  page,
}) => {
  await page.locator('tr[mat-row]', { hasText: 'Northwind Systems' }).click();

  await expect(page).toHaveURL('/admin/organizations/1?tab=info');
  await expect(page.locator('.title')).toHaveText('Northwind Systems');

  const breadcrumb = page.locator('.breadcrumb');
  await expect(breadcrumb).toContainText('Enclave');
  await expect(breadcrumb).toContainText('Admin');
  await expect(breadcrumb).toContainText('Organizations');
  await expect(breadcrumb).toContainText('Northwind Systems');
});

test('renders the resolved status and primary contact email in the header', async ({ page }) => {
  await page.goto('/admin/organizations/1');

  await expect(page.locator('enclave-details-header enclave-status')).toContainText('Active');
  await expect(page.locator('.subtitle')).toContainText('ops@northwind.io');
});

test('renders the Info tab fields for the selected organization', async ({ page }) => {
  await page.goto('/admin/organizations/1');

  const row = (label: string) =>
    page.locator('enclave-detail-row').filter({ hasText: label }).locator('.info-value');

  await expect(row('Name')).toHaveText('Northwind Systems');
  await expect(row('Primary Contact Email')).toHaveText('ops@northwind.io');
  await expect(row('Status')).toContainText('Active');
  await expect(row('Id')).toHaveText('1');
});

test.describe('Licenses tab', () => {
  test('shows the license count and a row per license for the organization', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Licenses/ }).click();

    await expect(page.locator('.license-count')).toHaveText('5');
    await expect(page.locator('tr[mat-row]')).toHaveCount(5);
  });

  test('maps each license row to its product name via the productId', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Licenses/ }).click();

    await expect(page.locator('tr[mat-row]', { hasText: 'Enclave Core' })).toBeVisible();
    await expect(page.locator('tr[mat-row]', { hasText: 'Vault Analytics' })).toBeVisible();
  });

  test('sorts rows by status when the Status column header is clicked', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Licenses/ }).click();

    await page.getByRole('columnheader', { name: 'Status' }).click();

    await expect(page.locator('tr[mat-row]').first()).toContainText('Active');
  });

  test('clicking a product name navigates to its details page', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Licenses/ }).click();

    await page.getByRole('link', { name: 'Enclave Core' }).click();

    await expect(page).toHaveURL('/admin/products/1?tab=info');
  });

  test('persists the Licenses tab across a reload', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Licenses/ }).click();
    await expect(page).toHaveURL('/admin/organizations/1?tab=licenses');

    await page.reload();

    await expect(page.locator('tr[mat-row]')).toHaveCount(5);
  });

  test('shows the empty state for an organization with no licenses', async ({ page }) => {
    await page.goto('/admin/organizations/6');
    await page.getByRole('tab', { name: 'Licenses' }).click();

    await expect(page.locator('.license-count')).toHaveCount(0);
    await expect(
      page.getByText('No licenses yet. Press the "Issue license" button above to add one.'),
    ).toBeVisible();
  });

  test('navigating via the Details menu item shows the license details page', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Licenses/ }).click();

    const row = page.locator('tr[mat-row]', { hasText: 'Vault Analytics' });
    // The actions button is `visibility: hidden` until the row is hovered/focused
    // (organization-details.scss).
    await row.hover();
    await row.getByRole('button', { name: 'Vault Analytics actions' }).click();
    await page.getByRole('menuitem', { name: 'Details' }).click();

    await expect(page).toHaveURL('/admin/licenses/2?tab=info');
    // Scoped to the page header's own title -- license 2 also has a pending renewal request,
    // whose banner (added alongside this test) renders its own unrelated `.title` element.
    await expect(page.locator('enclave-details-header .title')).toHaveText(
      'Vault Analytics - Northwind Systems',
    );
  });
});

test.describe('Users tab', () => {
  test('shows the user count and a row per user for the organization', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Users/ }).click();

    await expect(page.locator('.user-count')).toHaveText('4');
    await expect(page.locator('tr[mat-row]')).toHaveCount(4);
  });

  test('maps each user row to their full name from firstName and lastName', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Users/ }).click();

    await expect(page.locator('tr[mat-row]', { hasText: 'jamie Ellery' })).toBeVisible();
    await expect(page.locator('tr[mat-row]', { hasText: 'morgan Feld' })).toBeVisible();
  });

  test('sorts rows by status when the Status column header is clicked', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Users/ }).click();

    await page.getByRole('columnheader', { name: 'Status' }).click();

    await expect(page.locator('tr[mat-row]').first()).toContainText('Active');
  });

  test('persists the Users tab across a reload', async ({ page }) => {
    await page.goto('/admin/organizations/1');
    await page.getByRole('tab', { name: /Users/ }).click();
    await expect(page).toHaveURL('/admin/organizations/1?tab=users');

    await page.reload();

    await expect(page.locator('tr[mat-row]')).toHaveCount(4);
  });
});
