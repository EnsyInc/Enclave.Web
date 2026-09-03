import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/products');
});

test('opens the create dialog with an empty form', async ({ page }) => {
  await page.getByRole('button', { name: 'Create Product' }).click();

  const dialog = page.getByRole('dialog');
  // The submit button also reads "Create Product" in create mode, so scope to the dialog's
  // title span rather than getByText to avoid matching both.
  await expect(dialog.locator('.title')).toHaveText('Create Product');
  await expect(dialog.getByLabel('Name')).toHaveValue('');
  await expect(dialog.getByLabel('Description')).toHaveValue('');
});

test('closes the dialog when the header close button is clicked', async ({ page }) => {
  await page.getByRole('button', { name: 'Create Product' }).click();
  const dialog = page.getByRole('dialog');

  await dialog.getByRole('button', { name: 'Close dialog' }).click();

  await expect(dialog).toBeHidden();
});

test('blocks save and shows validation errors when required fields are empty', async ({ page }) => {
  await page.getByRole('button', { name: 'Create Product' }).click();
  const dialog = page.getByRole('dialog');

  await dialog.getByRole('button', { name: 'Create Product' }).click();

  await expect(dialog.getByText('Name is required')).toBeVisible();
  await expect(dialog.getByText('Status is required')).toBeVisible();
  await expect(dialog).toBeVisible();
});

test('closes the dialog once required fields are filled in and saved', async ({ page }) => {
  await page.getByRole('button', { name: 'Create Product' }).click();
  const dialog = page.getByRole('dialog');

  await dialog.getByLabel('Name').fill('New Product');
  await dialog.getByLabel('Status').click();
  await page.getByRole('option', { name: 'Active' }).click();

  // TODO: once Products subscribes to ProductFormDialogService.openCreate()'s afterClosed()
  // result (it currently discards it), assert the new row actually appears in the table here
  // instead of just that the dialog closed.
  await dialog.getByRole('button', { name: 'Create Product' }).click();

  await expect(dialog).toBeHidden();
});

test('opens the edit dialog pre-filled from the row action menu', async ({ page }) => {
  const row = page.locator('tr[mat-row]', { hasText: 'Enclave Core' });
  // The actions button is `visibility: hidden` until the row is hovered/focused (products.scss).
  await row.hover();
  await row.getByRole('button', { name: 'Enclave Core actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.title')).toHaveText('Edit Product');
  await expect(dialog.getByLabel('Name')).toHaveValue('Enclave Core');

  // TODO: once Products subscribes to ProductFormDialogService.openEdit()'s afterClosed()
  // result (it currently discards it), assert the edited row reflects the change here
  // instead of just that the dialog closed.
  await dialog.getByLabel('Name').fill('Enclave Core Renamed');
  await dialog.getByRole('button', { name: 'Save' }).click();

  await expect(dialog).toBeHidden();
});
