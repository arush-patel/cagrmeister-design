# @cagrmeister/design

The shared look of the CAGRMEISTER apps: colour and type tokens, a Tailwind v4 theme, vendored IBM Plex fonts, eight React components and two CLIs. Read [DESIGN.md](./DESIGN.md) for the rules; this file covers wiring.

Requires React 19, react-dom 19, react-router 7 (peer dependencies) and Tailwind v4.

## Install

In `package.json`:

```json
"@cagrmeister/design": "git+https://github.com/arush-patel/cagrmeister-design.git#v0.1.0"
```

then `npm install`. Installing a git dependency clones the repo and runs `prepare` (a `tsc` build), which pulls the package's dev dependencies, so the first install takes about 20 s. `npm ci --ignore-scripts` skips `prepare`, leaves no `dist/` and fails loudly. The package needs Node 20 or later; Vite 7 and 8 need Node 20.19 or later.

## Wire it up

```css
/* src/index.css */
@import "tailwindcss";
@import "@cagrmeister/design/strict.css"; /* theme.css + compat.css while migrating */
```
```js
// src/main.jsx
import "@cagrmeister/design/fonts.css";
import "@cagrmeister/design/components.css";
import { initTheme } from "@cagrmeister/design/theme";
initTheme();
```

```js
import "@cagrmeister/design/table.css"; // only once your tables follow DESIGN.md section 8
```

`table.css` styles every `th` and `td` globally and is unlayered, so it overrides Tailwind classes on cells (alignment, colour). Import it only once the app's tables follow DESIGN.md section 8. Until then leave it out, and move any cell alignment or colour onto the table chrome the app is building.

CSS entry points: `theme.css` (tokens + Tailwind mapping), `compat.css` (`app-dark:` / `app-light:` variants, for migration), `strict.css` (palette reset + `theme.css`; it replaces both `theme.css` and `compat.css`), `fonts.css`, `components.css`, `table.css`.

`strict.css` is an entry point of its own because the palette reset (`--color-*: initial`) must come before the token mapping, and one file guarantees the order.

## Components

Import from `@cagrmeister/design`. Components carry no CSS of their own; import `components.css`.

`Button`, `Panel` and the others accept `className` for extra hooks, but their own declarations (size, padding, colour) live in unlayered CSS and win over Tailwind utilities. To change layout, wrap the component, or use the `!` important modifier on that utility (for example `!px-2`).

### One react-router

`TabStrip` imports `NavLink` from `react-router`. An app that mounts its router from `react-router-dom` must resolve the same `react-router`, or two copies load and the page goes blank. Check with `npm ls react-router` (exactly one version), and add this to `vite.config`:

```js
resolve: { dedupe: ["react", "react-dom", "react-router"] },
```

| Component | Props |
|---|---|
| `AppHeader` | `logoSrc: string`, `logoAlt?: string` (default `"CAGRMEISTER"`), `showDate?: boolean` (default `true`), `children?` (right side, e.g. `ProfileMenu`) |
| `ProfileMenu` | `label: string`, `onLogout: () => void`, `onChangePassword?: () => void`, `logoutNote?: string`. Includes `ThemeToggle` and a logout confirmation. |
| `ThemeToggle` | none. Light / dark / match-system control. |
| `TabStrip` | `tabs: Tab[]` where `Tab = { id, label, to }`. Uses react-router `NavLink`, so render inside a router. |
| `Panel` | `title: string`, `sub?`, `meta?`, `children`, `className?` |
| `InstrumentBar` | `title: string`, `sub: string`, `subTestId?: string`, `controls?` (omit for an empty-controls note, `null` for none) |
| `FigureBand` | `headline: Figure`, `figures: Figure[]` where `Figure = { label, value, sub?, tone?: "pos" \| "neg" \| "wrn" }` |
| `Button` | all `<button>` props, plus `variant?: "default" \| "primary"`; `type` defaults to `"button"` |

Also exported: the `useTheme()` hook (`{ choice, resolved, setChoice }`) and the types `ThemeChoice`, `ResolvedTheme`, `Tab`, `Figure`.

Theme module, `@cagrmeister/design/theme`: `initTheme`, `setTheme`, `currentTheme`, `resolvedTheme`, `onThemeChange`. Tokens, `@cagrmeister/design/tokens`: `tokenValue(name, fallback?)`, which reads a token's current value for charts.

A typical page:

```jsx
import { AppHeader, ProfileMenu, TabStrip, InstrumentBar, FigureBand, Panel } from "@cagrmeister/design";

<AppHeader logoSrc="/logo.svg"><ProfileMenu label="Arush" onLogout={logout} /></AppHeader>
<TabStrip tabs={[{ id: "book", label: "Book", to: "/book" }]} />
<InstrumentBar title="Book" sub="As of today" />
<FigureBand headline={{ label: "NAV", value: "1.24 cr" }} figures={[]} />
<Panel title="Positions">…</Panel>
```

## Migrating an app that uses `app-light:` / `app-dark:` class pairs

1. **Install** the package (above).
2. **Import `theme.css` and `compat.css`** in `src/index.css` after `@import "tailwindcss";`, so existing `app-light:` / `app-dark:` classes keep working:
   ```css
   @import "tailwindcss";
   @import "@cagrmeister/design/theme.css";
   @import "@cagrmeister/design/compat.css";
   ```
3. **Dry-run the codemod:** `npx cagr-design-codemod src`. It lists, per file, how many class pairs it would replace with tokens, and any it cannot map ("unmapped"). Then apply it: `npx cagr-design-codemod --write src`.
4. **Fix what the checker reports:** `npx cagr-design-check src` prints `file:line rule token` for each off-system colour (rules `palette-class`, `theme-variant`, `gradient`, `hex-colour`) and exits 1 if there are any. Replace each with a token class. A line that must stay can end with `// design-ok`. `--no-hex` skips the hex rule.
5. **Swap to `strict.css`:** replace the `theme.css` and `compat.css` imports with `@import "@cagrmeister/design/strict.css";`, and add a script so the rule stays enforced:
   ```json
   "lint:design": "cagr-design-check src"
   ```

Both CLIs take one or more directories, scan `.js`, `.jsx`, `.ts` and `.tsx` files, and skip `node_modules` and `dist`.

## Upgrading

To upgrade: bump the tag in package.json, `npm install`.
