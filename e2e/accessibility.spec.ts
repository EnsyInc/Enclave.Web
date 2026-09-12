import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Products', path: '/admin/products' },
  { name: 'Organizations', path: '/admin/organizations' },
  { name: 'Licenses', path: '/admin/licenses' },
  { name: 'License Requests', path: '/admin/license-requests' },
  // These two render outside AppShell, so they exercise a different landmark structure than
  // every route above: no sidenav, no header, no skip link -- just the page's own <h1>.
  { name: 'Not Found', path: '/not-found' },
  { name: 'Forbidden', path: '/forbidden' },
];

// Matches ThemeService's STORAGE_KEY ('enclave-theme') — see theme.service.ts.
const themes = ['light', 'dark'] as const;

for (const theme of themes) {
  for (const route of routes) {
    test(`${route.name} has no automatically detectable accessibility violations (${theme} theme)`, async ({
      page,
    }) => {
      // Known color-contrast violation on the status pill text. enclave-status.scss now owns
      // the per-status colors on :host(...): "Active" uses --color-primary (~2.0:1) and
      // "Upcoming"/"Scheduled"/"Suspended" --color-secondary (~3.3:1), both under WCAG AA's
      // 4.5:1 against --color-card in light theme. ("Retired"/"Deactivated" use
      // --color-text-muted and pass.) Dark theme passes throughout for these two tokens.
      // Pending a color decision from UI/UX — remove this once fixed.
      test.fixme(
        (route.name === 'Products' ||
          route.name === 'Organizations' ||
          route.name === 'Licenses') &&
          theme === 'light',
        'Pending UI/UX color-contrast fix for status pill text (light theme only)',
      );

      // Distinct from the above: "Revoked" uses --color-error (#c46262), which fails 4.5:1
      // against --color-card in BOTH themes (3.98:1 light, 4.34:1 dark) -- the only status
      // color that doesn't clear dark theme. Same category of pending UI/UX color decision.
      test.fixme(
        route.name === 'Licenses',
        'Pending UI/UX color-contrast fix for the Revoked status pill (both themes)',
      );

      // Same root cause, different surface: --color-primary (#d8b315) is one value for both
      // themes, so anything that paints *text* with it fails on the light background
      // (#f8f8f5) at 1.9:1. Here it is the "Back to dashboard" label -- a text `matButton`
      // takes its label color from the primary role. Switching that button to a filled
      // variant would put --color-primary-text (#1c1c19) on the gold instead and clear this
      // in both themes; left as a UI/UX call rather than decided here.
      test.fixme(
        (route.name === 'Not Found' || route.name === 'Forbidden') && theme === 'light',
        'Pending UI/UX color-contrast fix for the primary action label (light theme only)',
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
    // (enclave-status renders in both the page header and the Info tab here too). Note the
    // header pill regressed from --color-secondary to --color-primary when the per-status
    // colors moved into enclave-status.scss, so this is now the lower-contrast case.
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
