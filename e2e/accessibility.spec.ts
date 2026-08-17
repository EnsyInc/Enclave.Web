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
