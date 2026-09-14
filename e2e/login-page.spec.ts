import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
});

test('renders the welcome heading and subtitle', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(
    page.getByText('Sign in with your organization account to access Enclave'),
  ).toBeVisible();
});

test('offers Microsoft sign-in but not Google, which is temporarily disabled', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Sign in with Microsoft' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toHaveCount(0);
});

test('renders without the app shell', async ({ page }) => {
  await expect(page.locator('mat-sidenav')).toHaveCount(0);
});

test('clicking Sign in with Microsoft does not error', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  // TODO: once AuthService.loginWithMicrosoft() does real OAuth redirect instead of its current
  // console.log stub, assert the resulting navigation/redirect here instead of just "no error".
  await page.getByRole('button', { name: 'Sign in with Microsoft' }).click();

  expect(pageErrors).toEqual([]);
});
