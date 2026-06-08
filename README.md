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

**1. Styles** — in your `globals.css`, after Tailwind:

```css
@import "tailwindcss";
@import "observatory-ui/styles.css";
@source "../node_modules/observatory-ui/src";
```

Provide the font CSS vars yourself (e.g. via `next/font`): `--font-sans`,
`--font-mono`, `--font-display`. Toggle the `dark` class on `<html>` for dark mode.

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
