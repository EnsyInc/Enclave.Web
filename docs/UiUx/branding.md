# Branding — Logo, Color Palette & Theming

## Logo

![EnsyLabs logo](./assets/logo.png)

Source file: [`assets/logo.png`](./assets/logo.png).

## Color palette

Confirmed by the FE designer (supersedes the earlier logo-sampled estimates). Implemented as CSS custom properties in [`src/styles/_tokens.scss`](../../src/styles/_tokens.scss).

| Token                | Role                                 | Light     | Dark      |
| -------------------- | ------------------------------------ | --------- | --------- |
| **BG**               | Base page background                 | `#F8F8F5` | `#14140C` |
| **Surface**          | Secondary surfaces (headers, panels) | `#FFFFFF` | `#1B1B13` |
| **Card**             | Elevated content containers          | `#FFFFFF` | `#232319` |
| **Border**           | Dividers, outlines                   | `#E7E3D7` | `#353323` |
| **Primary accent**   | Primary actions/highlights           | `#D8B315` | `#D8B315` |
| **Secondary accent** | Secondary actions, borders           | `#B88416` | `#B88416` |
| **Text**             | Body text                            | `#1C1C19` | `#FFFFFF` |
| **Secondary text**   | Muted/supporting text                | `#5E5E56` | `#B6B6A8` |

The destructive/danger color is not yet part of the designer's handoff — the implementation currently uses a conventional red (`#DC2626`) as a placeholder pending confirmation.

**Intent**: "the golden look of the logo" should carry through the product — near-black surfaces in dark mode, warm off-white in light mode, with the two golds used as accent/interactive color (Primary accent for primary actions/highlights, Secondary accent for secondary elements and borders), rather than a generic corporate blue/gray palette.

## Typography

**Inter** is the app's primary typeface, self-hosted via `@fontsource-variable/inter` (imported once in `src/styles.scss`) rather than loaded from a CDN. The font stack is exposed as the `--font-sans` token in [`src/styles/_typography.scss`](../../src/styles/_typography.scss): `'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.

## Light/dark mode

Every page — admin backoffice, customer backoffice, and the public status page — needs a **user-toggleable light/dark mode**, not just a dark theme:

- **Dark mode** is the natural home for this palette: near-black (`#14140C`) base with the two golds as accents, closely mirroring the logo itself.
- **Light mode** swaps to the warm off-white (`#F8F8F5`) base, keeping both golds as accents and dark text for readability. The gold identity must remain visible and recognizable in both modes — this isn't a generic white theme with the accent removed.
- **Contrast caution**: gold text directly on the light BG/Surface/Card colors has weak contrast, since both are light — fine for borders, fills, and buttons where the text color is controlled independently (e.g. dark text on a gold button), but body text and links in light mode should stay dark, using gold only for accents rather than as a text color on light backgrounds.
- This applies uniformly across all three surfaces (admin backoffice, customer backoffice, public status page) — it's a platform-wide requirement, not per-page.

## Buttons & interactive elements

- **Primary button**: solid Primary accent (`#D8B315`) fill with near-black text — the highest-emphasis action on a screen.
- **Secondary button**: outline/ghost style using the Secondary accent (`#B88416`) as the border and text color, transparent or dark fill. Two solid-gold buttons side by side blur the primary/secondary hierarchy (hard to visually rank at a glance, especially on a near-black background) — differentiating by fill-vs-outline solves that while staying entirely within the palette.
- **Destructive actions** (e.g. Revoke license, Reject renewal): should **not** use gold at all. Use a distinct, conventional danger color (red) so destructive actions are never confused with the brand's primary/secondary actions.
