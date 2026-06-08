# observatory-ui

> "The Observatory" — the shared design system behind [Polaris](https://github.com/JanPlessow/polaris) and its apps.

Tokens (OKLCH, light + dark) plus the reusable presentation primitives, in one
package so the hub and every app front-end look identical. Change a token here →
every consumer updates. The package ships **source** (no build step); consumers
transpile it.

## Install

```jsonc
// package.json
"dependencies": { "observatory-ui": "github:JanPlessow/observatory-ui" }
```

Next.js consumers must transpile it:

```js
// next.config.ts
const nextConfig = { transpilePackages: ["observatory-ui"] };
```

## Use

**1. Styles** — in your `globals.css`. The package ships **plain CSS** (token
values + utilities); the Tailwind directives must live in your own CSS, because
bundlers like Turbopack parse `@import`ed package CSS themselves and reject
`@theme`/`@apply`/`@custom-variant`. So:

```css
@import "tailwindcss";

/* These two must be in YOUR css (Turbopack rejects them from node_modules). */
@custom-variant dark (&:is(.dark *));
@theme inline {
  --color-background: var(--background);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-star: var(--star);
  --color-chart-1: var(--chart-1);
  /* …map every token you use; see polaris/src/app/globals.css for the full set… */
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);
}

/* Token VALUES + base/component utilities (plain CSS — safe to import). */
@import "observatory-ui/styles.css";
@source "../node_modules/observatory-ui/src";
```

Provide the font CSS vars yourself (e.g. via `next/font`): `--font-sans`,
`--font-mono`, `--font-display`. Toggle the `dark` class on `<html>` for dark mode.
The `@theme` mapping is stable boilerplate — copy it from Polaris's `globals.css`.

**2. Components**

```tsx
import { Panel, Gauge, BarSeries, Timeline, LineSeries, cn } from "observatory-ui";

<Panel title="Readiness" status="nominal" updatedAt="2m ago">
  <Gauge value={78} />
</Panel>;
```

## What's in here

- **Tokens** (`styles.css`): color (semantic + stellar-spectrum charts), type
  scale, radius, elevation, motion. OKLCH; light + dark.
- **Primitives**: `Panel` (shell with status / freshness / loading / empty /
  error / stale states), `Gauge`, `BarSeries`, `Timeline`, `LineSeries`,
  `StatusDot`, `Freshness`, and the `cn` helper.

The primitives are contract-agnostic — they take plain props, so any front-end
(the Polaris hub, an app's own page) can compose them.

## Verify

`npm run typecheck`.
