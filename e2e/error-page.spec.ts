import { expect, test } from '@playwright/test';

test.describe('not-found', () => {
  test('redirects an unmatched URL to the not-found page', async ({ page }) => {
    await page.goto('/this/route/does/not/exist');

    await expect(page).toHaveURL('/not-found');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await expect(page.locator('.status-code')).toHaveText('404');
  });

  test('redirects an unknown product id to the not-found page', async ({ page }) => {
    await page.goto('/admin/products/does-not-exist');

    await expect(page).toHaveURL('/not-found');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });

  test('returns to the dashboard from the primary action', async ({ page }) => {
    await page.goto('/not-found');
    await page.getByRole('button', { name: 'Back to dashboard' }).click();

    // The button points at '/', which the root route redirects on to the dashboard.
    await expect(page).toHaveURL('/admin/dashboard');
  });
});

test.describe('forbidden', () => {
  test('renders the forbidden page with its own status code and copy', async ({ page }) => {
    await page.goto('/forbidden');

    await expect(page.locator('.status-code')).toHaveText('403');
    await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
    await expect(
      page.getByText("You don't have permission to view this page. Ask your administrator"),
    ).toBeVisible();
  });
});

// The shell is scoped to the /admin subtree, so these pages render chromeless -- no sidenav to
// offer links the visitor may not be entitled to, and no duplicate branding beside the logo.
test.describe('error pages render without the app shell', () => {
  for (const url of ['/not-found', '/forbidden']) {
    test(`${url} has no sidenav`, async ({ page }) => {
      await page.goto(url);

      await expect(page.locator('.status-code')).toBeVisible();
      await expect(page.locator('mat-sidenav')).toHaveCount(0);
    });
  }
});
