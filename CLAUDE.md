# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

## Workflow

- **Don't implement anything unless the user explicitly asks you to.** Don't add features, fixes, refactors, or other code changes proactively — including ones that seem like an obvious next step or a natural follow-up to what was just discussed. If you think something should be done, say so and wait for the user to confirm before writing code.
- **Don't run `ng serve`/`npm start` or `ng build` yourself unless explicitly asked.** The user keeps their own `ng serve` running (via the VS Code "ng serve" launch config / "npm: start" task) with auto-rebuild on every file change, and uses that to tell you if a change broke something — a Claude-run build duplicates a check the user is already doing, and a Claude-started dev server can conflict with theirs. `tsc --noEmit`, `prettier`, and unit tests (`ng test`) are still fine to run directly, since the dev server doesn't cover those.

## Reusable building blocks

### `EnsyLabsIcon` (`src/app/core/icons/ensy-labs-icon/`)

Wraps `mat-icon` for consistent, theme-aware SVG icon usage anywhere in the app. Named after the EnsyLabs brand rather than the app (`enclave-*` prefix) since it's a candidate to be extracted into its own shared library later. Usage:

```html
<ensy-labs-icon name="dashboard" /> <ensy-labs-icon name="dashboard" color="var(--color-primary)" />
```

- `name` (required, `string`) — must match a name registered in `IconRegistryService` below, or Material logs a console error and renders nothing.
- `color` (optional, `string`) — any valid CSS color value, including `var(--color-*)` tokens. When omitted, the icon inherits `color` from its ancestor via normal CSS cascade (its SVGs use `stroke="currentColor"`), so it automatically matches surrounding text/theme without any extra wiring — only pass `color` when you need it to differ from context (e.g. an active/selected state).
- Sizing: defaults to `1.5rem`. Override per-usage via the `--ensy-labs-icon-size` CSS custom property (e.g. `.logo { --ensy-labs-icon-size: 3rem; }`), not by trying to size `mat-icon` directly.
- Inside a `mat-list-item` (or anywhere Material expects a specific content slot), pair it with the relevant attribute directive, e.g. `<ensy-labs-icon name="dashboard" matListItemIcon />` — Material's content projection is attribute-based, not tag-based, so `<ensy-labs-icon>` alone won't be recognized as an icon slot without it.

### `IconRegistryService` (`src/app/core/icons/icon-registry.service.ts`)

`providedIn: 'root'` singleton that registers every SVG icon `EnsyLabsIcon` can render, via `MatIconRegistry.addSvgIcon`. It's wired up once by injecting it in `App` (`app.ts`) purely for the constructor side effect — no need to inject it anywhere else.

To add a new icon: drop the SVG in `public/icons/`, edit its `stroke`/`fill` attributes to `currentColor` (so `EnsyLabsIcon`'s `color` input/inheritance works), then add one `addSvgIcon(...)` call in the constructor here.

Currently registered names: `logo`, `dashboard`, `products`, `organizations`, `licenses`, `license-requests`, `moon`, `sidenav`, `chevrons-up-down`.

### `ThemeService` (`src/app/core/theme/theme.service.ts`)

`providedIn: 'root'` singleton managing the light/dark theme, persisted to `localStorage` and applied via `document.documentElement.dataset['theme']` (read by `src/styles/_tokens.scss`'s `[data-theme]` selectors). Inject it wherever theme state or the toggle action is needed:

```ts
protected readonly themeService = inject(ThemeService);
```

```html
<button (click)="themeService.toggle()">Toggle theme</button> {{ themeService.theme() }}
<!-- 'dark' | 'light' -->
```

## Testing gotchas

- **`localStorage` and `window.matchMedia` are not reliably present in this Vitest + jsdom setup** — code that touches either directly (e.g. `ThemeService`, `AppShell`'s sidenav-collapse persistence) will intermittently throw `Cannot read properties of undefined` in specs that don't stub them, even in files that previously worked, because Node's own experimental `globalThis.localStorage` can shadow jsdom's. Every spec that constructs a component/service touching these must `vi.stubGlobal('localStorage', <mock Storage>)` and, if nothing is stored (so `ThemeService` falls through to it), `vi.stubGlobal('matchMedia', ...)` too — see the `createStorageMock()` helper duplicated in `theme.service.spec.ts`, `app.spec.ts`, and `app-shell.spec.ts`. Always pair with `vi.unstubAllGlobals()` in `afterEach`.
- **`BreakpointObserver`'s real implementation needs a fuller `matchMedia` stub than `ThemeService` does** — it calls the legacy `mql.addListener`/`removeListener` on the object `matchMedia()` returns, not just reads `.matches`. A stub that only returns `{ matches: false }` works for `ThemeService` but throws `mql.addListener is not a function` the moment a component using `BreakpointObserver` (e.g. `AppShell`, or `App` which renders it) is constructed with the real observer instead of a faked one.

## Angular Material gotchas (v22.1.x)

Non-obvious internals discovered while building the app shell (`AppShell`/`AppHeader`/`EnsyLabsIcon`, under `src/app/core/layout/` and `src/app/core/icons/`) by reading the compiled source in `node_modules/@angular/material/**`. Re-verify against installed source if `@angular/material` is upgraded past 22.1.x, since these are implementation details, not public API guarantees.

- **`mat.core()` is a deprecated no-op** in this version (`@mixin core() {}` is literally empty, slated for removal). `mat.theme()` alone emits everything needed — don't bother calling `mat.core()`.
- **`mat.theme()`'s `$overrides` param** lets you re-point specific M3 system-color roles (`primary`, `on-primary`, `surface`, `on-surface`, `background`, `on-background`, `outline`, `error`, `on-error`) at our own `--color-*` tokens instead of hand-writing CSS custom property overrides. See `src/styles.scss`. Roles left un-overridden fall back to the seed palette and only track `prefers-color-scheme`, not our `[data-theme]` toggle.
- **`mat-nav-list` forces `border-radius: corner-full` (pill shape)** on `.mat-mdc-list-item` via `--mat-list-active-indicator-shape` — a different, nav-list-specific token from `list-list-item-container-shape` (`corner-none`), which is a red herring if you go looking for the shape source. Override `border-radius` on the base `a` selector (not just `.active`) to fix every state at once — Material's hover/focus overlay (`.mdc-list-item-interactive::before`) inherits radius via `border-radius: inherit`.
- **Nav-list icon color reads the `on-surface-variant` M3 role**, distinct from `on-surface` — easy to miss when bridging tokens in `mat.theme()`'s `$overrides`, since it's not the role most people think to override first.
- **Icon-led list items (`matListItemIcon`) get asymmetric padding by default**: `.mdc-list-item--with-leading-icon.mdc-list-item { padding-left: 0; padding-right: 16px; }`. This silently breaks `justify-content: center` when building an icon-only collapsed rail — the fix has to reset both sides equal on the `<a>` itself, not just adjust the icon's own margin.
- **`.mdc-list-item__content` (the label wrapper) has `flex: 1`** and stays in the layout even when the `[matListItemTitle]` span inside it is `display: none` — it still greedily claims free space unless also hidden. It also contains an empty `<span class="mat-mdc-list-item-unscoped-content">` catch-all slot that won't appear in your own template source.
- **`mode="side"` sidenav gets a default `border-right: 1px solid var(--mat-sidenav-container-divider-color, transparent)`** on `.mat-drawer-side` — zero it explicitly if you're building custom dividers elsewhere, or you'll get a stray 1px seam where they meet.
- **`.mat-drawer-transition .mat-drawer` sets `transition: transform 400ms ...` as a full shorthand**, added dynamically by Material's JS once the drawer becomes interactive. Any custom `transition` added to the same element (e.g. for theme-color fades) needs `!important` to survive — shorthand properties fully replace rather than merge across competing rules, so without it your custom transition gets silently wiped whenever this class is present.
- **`MatDrawerContainer` doesn't auto-detect CSS-driven sidenav width changes** (e.g. toggling a `.collapsed` class that changes `--mat-sidenav-container-width`) — `mat-sidenav-content`'s margin only recalculates on window resize or the drawer's own `mode`/`opened` inputs changing. Fix: call the container's public `updateContentMargins()` method manually, queried via `@ViewChild(MatSidenavContainer)`.
- **`updateContentMargins()`'s width reading is a live geometry snapshot, not a target lookup** — internally it's just `_getWidth() { return this._elementRef.nativeElement.offsetWidth || 0; }`. That means it always reports whatever the sidenav's width _is right now_, including mid-transition values. Calling it once — whether via `afterNextRender()` right after toggling, or on `transitionend` — either reads a stale pre-animation width or only gets the correct value after the animation is already visually done, producing a jarring one-step-behind resize. See `AppShell` (`src/app/core/layout/app-shell/app-shell.ts`) for the actual fix: `(transitionstart)`/`(transitionend)` bound on `<mat-sidenav>`, filtered to `event.propertyName === 'width'`, driving a `requestAnimationFrame` loop that calls `updateContentMargins()` every frame for the duration of the transition so the content margin tracks the sidenav's live animated width in near real-time, then a final authoritative call + `cancelAnimationFrame` on `transitionend`.
- **Because that rAF loop drives `mat-sidenav-content`'s margin manually, Material's own `.mat-drawer-transition .mat-drawer-content` rule must be neutralized** — it sets `transition-property: transform, margin-left, margin-right` via longhand properties (not the `transition` shorthand), so it keeps trying to ease its own version of each JS-set margin value on top of the rAF loop's, producing double-easing (a laggy "chasing" effect instead of 1:1 tracking). Fix: `mat-sidenav-content { transition: none !important; }` in `app-shell.scss`. This used to be suppressed by accident — an earlier, blanket `*, *::before, *::after { transition: ... !important }` rule (for theme-color fades) used the `transition` _shorthand_, which fully replaces rather than merges a selector's `transition-property`/`-duration`/`-timing-function`, so it silently wiped Material's margin transition along with everything else. Once that blanket rule got scoped down to only apply during an actual theme toggle (see the specificity gotcha below), the suppression had to become explicit instead of incidental.
- **A component's own scoped stylesheet selectors silently gain an extra specificity point over global ones.** Angular's default emulated encapsulation appends an `[_ngcontent-ng-cXXXX]` attribute selector to every rule in a component's `styleUrl` file, and attribute selectors count the same as classes for specificity — so a plain type selector in a component file (e.g. `mat-sidenav { transition: ... !important; }` in `app-shell.scss`) can outrank a class selector in the _global_ `styles.scss` (e.g. `.theme-transitioning *`), even though it looks lower-specificity on paper. Global stylesheet rules get no such attribute, since they aren't scoped to any component. Symptom we hit: `mat-sidenav`'s own background/color/border-color stopped fading during a theme toggle, because its scoped `width`-only transition rule quietly won over the global color-transition rule and _replaced_ (not added to) its `transition` shorthand. Fix pattern: use `:host-context(.some-ancestor-class) selector { ... }` inside the component stylesheet to explicitly restate the full property list for that ancestor state, rather than relying on the global rule to reach in.
- **`<mat-divider vertical>` renders invisible unless given an explicit height.** `.mat-divider` is `display: block` with no content — that's enough for the horizontal variant (`border-top`, and block elements default to filling their container's _width_), but there's no equivalent default for _height_, so the vertical variant's `border-right` renders across 0px and shows nothing. Fix: give `.mat-divider-vertical` an explicit `height` (and `margin: 0`, since `align-items: center` on the flex parent needs a clean box to center — Material's own `margin: 0` on `.mat-divider` is easy to accidentally override with a same-named custom rule meant only for the horizontal instance; scope it with `mat-divider:not(.mat-divider-vertical) { ... }` if you have per-component divider spacing rules, or the vertical one silently inherits horizontal-only spacing meant for something else).
