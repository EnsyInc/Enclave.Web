# TODO

## #7 — Shared Not Found page

**Purpose:** per `docs/UiUx/licensing-screens.md`'s "Not Found" entry, a single shared page for:

- unmatched routes (needs a wildcard `**` route in `app.routes.ts` — doesn't exist yet)
- access-denied cases
- an unknown product id on the Product detail page (redirect target via a resolver/guard returning `RedirectCommand`/`UrlTree`)

Reusable later for Organization detail / License detail once those exist.

## Tests

Still need to add/update tests for everything done this session:

- `confirmation-dialog.spec.ts` — needs updating for new DI deps (`MatDialogRef`, `MAT_DIALOG_DATA`)
- `product-form-overlay.spec.ts` — needs updating for new DI deps
- `products.spec.ts` — now injects `ProductFormDialogService` / `ConfirmationDialogService` instead of `MatDialog` directly, may need updating too
- No tests yet for: `ProductFormDialogService`, `ConfirmationDialogService`, `EnclaveTitleStrategy`, `product-breadcrumb.resolver.ts`, `product-details.ts`
