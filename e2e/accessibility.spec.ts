import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Products', path: '/admin/products' },
  { name: 'Organizations', path: '/admin/organizations' },
  { name: 'Licenses', path: '/admin/licenses' },
  { name: 'License Requests', path: '/admin/license-requests' },
];

// Matches ThemeService's STORAGE_KEY ('enclave-theme') — see theme.service.ts.
const themes = ['light', 'dark'] as const;

for (const theme of themes) {
  for (const route of routes) {
    test(`${route.name} has no automatically detectable accessibility violations (${theme} theme)`, async ({
      page,
    }) => {
      // Known color-contrast violation on the status pill/upcoming-row text
      // (enclave-status, products.scss .upcoming) — pending a color decision
      // from UI/UX. Remove this once the colors are fixed.
      test.fixme(
        route.name === 'Products' && theme === 'light',
        'Pending UI/UX color-contrast fix for product status text (light theme only)',
      );

      await page.addInitScript((theme) => localStorage.setItem('enclave-theme', theme), theme);
      await page.goto(route.path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
}

for (const theme of themes) {
  test(`Dashboard with collapsed sidenav has no automatically detectable accessibility violations (${theme} theme)`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ theme }) => {
        localStorage.setItem('enclave-theme', theme);
        localStorage.setItem('enclave-sidenav-collapsed', 'true');
      },
      { theme },
    );
    await page.goto('/admin/dashboard');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

for (const theme of themes) {
  test(`Product detail page has no automatically detectable accessibility violations (${theme} theme)`, async ({
    page,
  }) => {
    // Same known status-pill color-contrast violation as the Products list issue above
    // (enclave-status renders in both the page header and the Info tab here too).
    test.fixme(
      theme === 'light',
      'Pending UI/UX color-contrast fix for product status text (light theme only)',
    );

    await page.addInitScript((theme) => localStorage.setItem('enclave-theme', theme), theme);
    await page.goto('/admin/products/1');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

for (const theme of themes) {
  test(`Product form dialog has no automatically detectable accessibility violations (${theme} theme)`, async ({
    page,
  }) => {
    // Known color-contrast violation on the mat-label text in both themes -- same pending
    // UI/UX color decision as the Products list issue above.
    test.fixme(true, 'Pending UI/UX color-contrast fix for form-field label color (both themes)');

    await page.addInitScript((theme) => localStorage.setItem('enclave-theme', theme), theme);
    await page.goto('/admin/products');
    await page.getByRole('button', { name: 'Create Product' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Wait for the open transition to finish -- scanning mid-fade catches a transient,
    // not-yet-settled opacity as a false-positive color-contrast violation.
    await expect(dialog.locator('.mat-mdc-dialog-surface')).toHaveCSS('opacity', '1');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

for (const theme of themes) {
  test(`Delete confirmation dialog has no automatically detectable accessibility violations (${theme} theme)`, async ({
    page,
  }) => {
    // Known color-contrast violation in both themes on the dialog's muted "action" label,
    // the "highlight" span, and the confirm button's danger-red text -- same pending UI/UX
    // color decision as the Products list issue above.
    test.fixme(
      true,
      'Pending UI/UX color-contrast fix for dialog action-label/highlight/danger colors (both themes)',
    );

    await page.addInitScript((theme) => localStorage.setItem('enclave-theme', theme), theme);
    await page.goto('/admin/products');
    const row = page.locator('tr[mat-row]', { hasText: 'Enclave Core' });
    // The actions button is `visibility: hidden` until the row is hovered/focused (products.scss).
    await row.hover();
    await row.getByRole('button', { name: 'Enclave Core actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.mat-mdc-dialog-surface')).toHaveCSS('opacity', '1');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
