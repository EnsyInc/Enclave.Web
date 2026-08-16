import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Products', path: '/admin/products' },
  { name: 'Organizations', path: '/admin/organizations' },
  { name: 'Licenses', path: '/admin/licenses' },
  { name: 'License Requests', path: '/admin/license-requests' },
];

for (const route of routes) {
  test(`${route.name} has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route.path);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
