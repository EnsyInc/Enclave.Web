# TODO

1. Finish org details page
2. ~~Extract details-header component~~
3. ~~Create persistent tab directive (for mat tabs, they should also appear in the URL for better navigation)~~
4. ~~Refactor enclave-status — it should only accept known statuses and provide consistent styling for each~~

## Extraction candidates (from codebase audit)

1. ~~Resolver factory — `product.resolver.ts` and `organization.resolver.ts` have identical control flow (lookup by id → `RedirectCommand` to not-found → breadcrumb/title); collapse into a `createDetailsResolvers<T>(paramName, getById, collectionLabel, defaultTitle)` factory~~
2. ~~`localStorage` read/write guard — `theme.service.ts` and `app-shell.ts` (sidenav-collapse) both reimplement the same SSR/test-safe persistence guard~~
3. Status/role union boilerplate — `(typeof X_STATUSES)[number]` repeated 4x across models; extract a `ValuesOf<T>` type helper
4. List-table SCSS pattern — header styling, status-pill vars, and hover-reveal actions duplicated near-verbatim between `product-list.scss`/`organization-list.scss`
5. Icon action button — `enclave-detail-card` and `enclave-page-header` both hand-roll an identical icon+text action button; extract a shared `enclave-icon-action-button`
6. Eyebrow label style — mono/uppercase/muted text style duplicated between `enclave-detail-row.scss` and `enclave-dialog-header.scss` (differs only in font-size)
7. Route-tree walk helper — `app-header.ts`'s `getBreadcrumb()`/`findSection()` both walk the router tree with the same loop shape
