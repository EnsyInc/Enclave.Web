import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/license-requests');
});

test('navigating via the Details menu item shows the license request page and full breadcrumb', async ({
  page,
}) => {
  await page.getByPlaceholder('Search License Requests').pressSequentially('Northwind Systems');
  const row = page.locator('tr[mat-row]', { hasText: 'Vault Analytics' });
  // The actions button is `visibility: hidden` until the row is hovered/focused (license-request-list.scss).
  await row.hover();
  await row.getByRole('button', { name: 'Northwind Systems_Vault Analytics actions' }).click();
  await page.getByRole('menuitem', { name: 'Details' }).click();

  await expect(page).toHaveURL('/admin/license-requests/1?tab=info');
  await expect(page.locator('.title')).toHaveText('Vault Analytics - Northwind Systems');

  const breadcrumb = page.locator('.breadcrumb');
  await expect(breadcrumb).toContainText('Enclave');
  await expect(breadcrumb).toContainText('Admin');
  await expect(breadcrumb).toContainText('License Requests');
  await expect(breadcrumb).toContainText('Vault Analytics - Northwind Systems');
});

test('renders the resolved status in the header', async ({ page }) => {
  await page.goto('/admin/license-requests/1');

  await expect(page.locator('enclave-details-header enclave-status')).toContainText('Pending');
});

test('renders the Info tab fields for the selected license request', async ({ page }) => {
  await page.goto('/admin/license-requests/1');

  const row = (label: string) =>
    page.locator('enclave-detail-row').filter({ hasText: label }).locator('.info-value');

  await expect(row('Product')).toHaveText('Vault Analytics');
  await expect(row('Organization')).toHaveText('Northwind Systems');
  await expect(row('Requested By')).toHaveText('jamie.ellery@northwind.io');
  await expect(row('Status')).toContainText('Pending');
});

test.describe('subtitle', () => {
  test('shows "Renewal" for a request made against an existing license', async ({ page }) => {
    await page.goto('/admin/license-requests/1');

    await expect(page.locator('.subtitle')).toContainText('Renewal');
  });

  test('shows "New License" for a request with no existing license', async ({ page }) => {
    await page.goto('/admin/license-requests/2');

    await expect(page.locator('.subtitle')).toContainText('New License');
  });
});

test('clicking the Product row navigates to the product details page', async ({ page }) => {
  await page.goto('/admin/license-requests/1');

  await page.getByRole('link', { name: 'Vault Analytics' }).click();

  await expect(page).toHaveURL('/admin/products/2?tab=info');
});

test('clicking the Organization row navigates to the organization details page', async ({
  page,
}) => {
  await page.goto('/admin/license-requests/1');

  await page.getByRole('link', { name: 'Northwind Systems' }).click();

  await expect(page).toHaveURL('/admin/organizations/1?tab=info');
});

test('clicking the existing-license link navigates to the license details page', async ({
  page,
}) => {
  await page.goto('/admin/license-requests/1');

  await page.getByRole('link', { name: 'See existing license' }).click();

  await expect(page).toHaveURL('/admin/licenses/2?tab=info');
});

test.describe('action buttons', () => {
  test('shows Reject and Approve for a Pending request', async ({ page }) => {
    await page.goto('/admin/license-requests/1');

    await expect(page.getByRole('button', { name: 'Reject' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
  });

  test('hides Reject and Approve for a resolved request', async ({ page }) => {
    await page.goto('/admin/license-requests/2');

    await expect(page.getByRole('button', { name: 'Reject' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0);
  });
});

test.describe('Notes tab', () => {
  test('shows the rejection reason for a Rejected request that has one', async ({ page }) => {
    await page.goto('/admin/license-requests/3');

    const responses = page.locator('.response');
    await expect(responses.first()).toContainText(
      'Product still in Upcoming status; not available for general licensing yet.',
    );
    await expect(responses.first()).toContainText('Enclave Admin');
  });

  test('falls back to "No notes" for a Rejected request with no reason', async ({ page }) => {
    await page.goto('/admin/license-requests/9');

    await expect(page.locator('.response').first()).toContainText('No notes');
  });

  test('shows the requester notes', async ({ page }) => {
    await page.goto('/admin/license-requests/1');

    await expect(page.locator('.response').last()).toContainText('Renewing before end of quarter.');
  });
});
