# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

## Reusable building blocks

### `EnsyIcon` (`src/app/core/icons/ensy-icon/`)

Wraps `mat-icon` for consistent, theme-aware SVG icon usage anywhere in the app. Usage:

```html
<ensy-icon name="dashboard" />
<ensy-icon name="dashboard" color="var(--color-primary)" />
```

- `name` (required, `string`) — must match a name registered in `IconRegistryService` below, or Material logs a console error and renders nothing.
- `color` (optional, `string`) — any valid CSS color value, including `var(--color-*)` tokens. When omitted, the icon inherits `color` from its ancestor via normal CSS cascade (its SVGs use `stroke="currentColor"`), so it automatically matches surrounding text/theme without any extra wiring — only pass `color` when you need it to differ from context (e.g. an active/selected state).
- Sizing: defaults to `1.5rem`. Override per-usage via the `--ensy-icon-size` CSS custom property (e.g. `.logo { --ensy-icon-size: 3rem; }`), not by trying to size `mat-icon` directly.
- Inside a `mat-list-item` (or anywhere Material expects a specific content slot), pair it with the relevant attribute directive, e.g. `<ensy-icon name="dashboard" matListItemIcon />` — Material's content projection is attribute-based, not tag-based, so `<ensy-icon>` alone won't be recognized as an icon slot without it.

### `IconRegistryService` (`src/app/core/icons/icon-registry.service.ts`)

`providedIn: 'root'` singleton that registers every SVG icon `EnsyIcon` can render, via `MatIconRegistry.addSvgIcon`. It's wired up once by injecting it in `App` (`app.ts`) purely for the constructor side effect — no need to inject it anywhere else.

To add a new icon: drop the SVG in `public/icons/`, edit its `stroke`/`fill` attributes to `currentColor` (so `EnsyIcon`'s `color` input/inheritance works), then add one `addSvgIcon(...)` call in the constructor here.

Currently registered names: `logo`, `dashboard`, `products`, `organizations`, `licenses`, `license-requests`, `moon`, `sidenav`, `chevrons-up-down`.

### `ThemeService` (`src/app/core/theme/theme.service.ts`)

`providedIn: 'root'` singleton managing the light/dark theme, persisted to `localStorage` and applied via `document.documentElement.dataset['theme']` (read by `src/styles/_tokens.scss`'s `[data-theme]` selectors). Inject it wherever theme state or the toggle action is needed:

```ts
protected readonly themeService = inject(ThemeService);
```

```html
<button (click)="themeService.toggle()">Toggle theme</button>
{{ themeService.theme() }} <!-- 'dark' | 'light' -->
```

## Angular Material gotchas (v22.1.x)

Non-obvious internals discovered while building the app shell (`AppShell`/`AppHeader`/`EnsyIcon`, under `src/app/core/layout/` and `src/app/core/icons/`) by reading the compiled source in `node_modules/@angular/material/**`. Re-verify against installed source if `@angular/material` is upgraded past 22.1.x, since these are implementation details, not public API guarantees.

- **`mat.core()` is a deprecated no-op** in this version (`@mixin core() {}` is literally empty, slated for removal). `mat.theme()` alone emits everything needed — don't bother calling `mat.core()`.
- **`mat.theme()`'s `$overrides` param** lets you re-point specific M3 system-color roles (`primary`, `on-primary`, `surface`, `on-surface`, `background`, `on-background`, `outline`, `error`, `on-error`) at our own `--color-*` tokens instead of hand-writing CSS custom property overrides. See `src/styles.scss`. Roles left un-overridden fall back to the seed palette and only track `prefers-color-scheme`, not our `[data-theme]` toggle.
- **`mat-nav-list` forces `border-radius: corner-full` (pill shape)** on `.mat-mdc-list-item` via `--mat-list-active-indicator-shape` — a different, nav-list-specific token from `list-list-item-container-shape` (`corner-none`), which is a red herring if you go looking for the shape source. Override `border-radius` on the base `a` selector (not just `.active`) to fix every state at once — Material's hover/focus overlay (`.mdc-list-item-interactive::before`) inherits radius via `border-radius: inherit`.
- **Nav-list icon color reads the `on-surface-variant` M3 role**, distinct from `on-surface` — easy to miss when bridging tokens in `mat.theme()`'s `$overrides`, since it's not the role most people think to override first.
- **Icon-led list items (`matListItemIcon`) get asymmetric padding by default**: `.mdc-list-item--with-leading-icon.mdc-list-item { padding-left: 0; padding-right: 16px; }`. This silently breaks `justify-content: center` when building an icon-only collapsed rail — the fix has to reset both sides equal on the `<a>` itself, not just adjust the icon's own margin.
- **`.mdc-list-item__content` (the label wrapper) has `flex: 1`** and stays in the layout even when the `[matListItemTitle]` span inside it is `display: none` — it still greedily claims free space unless also hidden. It also contains an empty `<span class="mat-mdc-list-item-unscoped-content">` catch-all slot that won't appear in your own template source.
- **`mode="side"` sidenav gets a default `border-right: 1px solid var(--mat-sidenav-container-divider-color, transparent)`** on `.mat-drawer-side` — zero it explicitly if you're building custom dividers elsewhere, or you'll get a stray 1px seam where they meet.
- **`.mat-drawer-transition .mat-drawer` sets `transition: transform 400ms ...` as a full shorthand**, added dynamically by Material's JS once the drawer becomes interactive. Any custom `transition` added to the same element (e.g. for theme-color fades) needs `!important` to survive — shorthand properties fully replace rather than merge across competing rules, so without it your custom transition gets silently wiped whenever this class is present.
- **`MatDrawerContainer` doesn't auto-detect CSS-driven sidenav width changes** (e.g. toggling a `.collapsed` class that changes `--mat-sidenav-container-width`) — `mat-sidenav-content`'s margin only recalculates on window resize or the drawer's own `mode`/`opened` inputs changing. Fix: call the container's public `updateContentMargins()` method manually (query it via `@ViewChild(MatSidenavContainer)`) — but it must run *after* Angular's next render, via `afterNextRender()`, not synchronously in the same click handler, or it reads the sidenav's stale pre-toggle width.
