import { expect, Page, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/products');
});

async function openDeleteDialog(page: Page): Promise<void> {
  const row = page.locator('tr[mat-row]', { hasText: 'Enclave Core' });
  // The actions button is `visibility: hidden` until the row is hovered/focused (products.scss).
  await row.hover();
  await row.getByRole('button', { name: 'Enclave Core actions' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
}

test('opens the delete confirmation dialog with the product name highlighted', async ({
  page,
}) => {
  await openDeleteDialog(page);

  const dialog = page.getByRole('dialog');
  // getByText also matches the .header ancestor here, since its combined text (action +
  // title spans) contains the same substring -- scope to the title span specifically.
  await expect(dialog.locator('.title')).toHaveText('Delete "Enclave Core"');
  await expect(dialog.locator('.highlight')).toHaveText('Enclave Core');
});

test('closes without deleting when Cancel is clicked', async ({ page }) => {
  await openDeleteDialog(page);
  const dialog = page.getByRole('dialog');

  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByRole('link', { name: 'Enclave Core' })).toBeVisible();
});

test('closes when the confirm button is clicked', async ({ page }) => {
  await openDeleteDialog(page);
  const dialog = page.getByRole('dialog');

  // TODO: once Products wires up real deletion (openDeleteProductDialog's confirm handler is
  // currently just a console.log stub), assert the row is actually removed from the table here
  // instead of just that the dialog closed.
  await dialog.getByRole('button', { name: 'Delete' }).click();

  await expect(dialog).toBeHidden();
});
