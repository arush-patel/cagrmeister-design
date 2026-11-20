# CAGRMEISTER design principles

Eight rules. Each says what to do, then names the tokens and classes that implement it. Tokens live in `src/css/tokens.css`, the Tailwind mapping in `src/css/theme.css`, the component classes in `src/css/components.css` and `src/css/table.css`.

## 1. Character

Bloomberg density, Linear clarity: data-rich and visually calm.

Implemented by: the 13px base and `leading-snug` set on `html, body` in `theme.css`; hairline borders (`border-border`, `border-line-2`); flat surfaces, with `shadow-card` as the only mapped shadow utility.

## 2. Never

Gradients, gauges, pie charts, gradient KPI cards, crypto aesthetics, AI-sparkle graphics, decorative red/green.

Enforced by: `cagr-design-check` flags `bg-gradient-*` / `bg-linear-*` (rule `gradient`), Tailwind palette colours (`palette-class`) and hex colours (`hex-colour`). `strict.css` removes Tailwind's default palette, so a palette class produces no CSS at all. Charts and imagery are not checked; the rule still holds for them.

## 3. Surfaces

Four levels: `bg` the page, `card` carries data, `panel` carries controls (bars, table headers), `sunken` is recessed. A control strip and a data strip never share a surface.

Implemented by: tokens `--bg`, `--card`, `--panel`, `--sunken`; Tailwind classes `bg-bg`, `bg-card`, `bg-panel`, `bg-sunken`. In components, `AppHeader` and `TabStrip` sit on `panel`; `InstrumentBar`, `FigureBand` and `Panel` use `card`; table headers use `panel` (rule 8).

## 4. Type

IBM Plex Sans for words; IBM Plex Mono with tabular figures for every number; 13px base; labels uppercase, 10–12px, tracked 0.05–0.08em.

Implemented by: `fonts.css` (vendored woff2, no external request; Sans 400/500/600/700, Mono 400/500/600); tokens `--f-sans`, `--f-mono`; Tailwind classes `font-sans`, `font-mono`; `font-variant-numeric: tabular-nums` on the figure and table number styles in `components.css` / `table.css`. When you write a number in your own markup, give it `font-mono tabular-nums`.

## 5. Colour means something

`positive`/`negative`/`warn` only for signed values and states; `blue` for the primary action and the active tab; never a Tailwind palette colour, never a hex in a component — tokens only (`tokenValue` for charts).

Implemented by: tokens `--positive`, `--negative`, `--warn` and their tints `--pos-soft`, `--neg-soft`, `--warn-soft`; `--blue` and `--accent-ink` (classes `bg-blue`, `text-accent-ink`); `--on-accent` for ink on a filled accent (`text-on-accent`). Cluster identity uses `--c1` / `--c2` and their `-soft` tints. `tokenValue(name, fallback?)` from `@cagrmeister/design/tokens` reads the current computed value of a token (for example `tokenValue("--positive", "#0a8f4e")`) for chart libraries that take literals; re-read it on theme change (`useTheme()` re-renders on change, and the `cagrmeister:theme` document event fires). `FigureBand` tones `pos`/`neg`/`wrn` map to positive/negative/warn.

## 6. Dark

A purpose-built counterpart, not an inversion; three states, `system` the default.

Implemented by: the dark values in `tokens.css`, declared twice on purpose: once under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, once under `:root[data-theme="dark"]`. `system` stamps nothing on `<html>`; `light` / `dark` stamp `data-theme`. API: `initTheme()` (call once at startup), `setTheme(choice)`, `currentTheme()`, `resolvedTheme()`, `onThemeChange(fn)` from `@cagrmeister/design/theme`; `useTheme()` and `ThemeToggle` from the main entry. The choice persists in `localStorage` under `cagrmeister:theme`. Accent hues lift in dark and the soft tints become alpha, so do not hand-pick dark colours; `compat.css` provides `app-dark:` / `app-light:` variants only for migration.

## 7. Layout

Header (logo, date, profile menu) → tab strip → instrument bar (title, sub, controls) → optional figure band (one 25px headline, up to five 15px figures) → panels.

Implemented by, in order: `AppHeader` (`shell-brand`) containing `ProfileMenu` as a child; `TabStrip` (`view-tabs`, `view-tab`, `active`); `InstrumentBar` (`instrument-bar*`); `FigureBand` (`figure-band*`, one `headline` plus `figures`); `Panel` (`ui-panel*`). `Button` (`sim-btn`, `sim-btn-primary`) is the control used inside bars.

## 8. Tables

Numbers right-aligned in Mono; 9.5px uppercase sticky headers on `panel`; hairline rows; `highlight` on hover.

Implemented by: `table.css`, which styles bare `table`, `th`, `td`, `tbody tr` and `tbody tr:hover` (background `--highlight`), plus `.table-scroll-x` for horizontal scroll. Header cells use `--panel`, `position: sticky`, 9.5px uppercase. Right-align number cells and give them `font-mono tabular-nums` in your own markup.

## Token reference

Every colour token mapped to Tailwind by `theme.css`. The class is the suffix applied to a colour utility: `--panel` gives `bg-panel`, `text-panel`, `border-panel`, and so on; `--text` gives `text-text`, `bg-text`. Values are from `tokens.css`.

| Token | Tailwind class suffix | Light | Dark |
|---|---|---|---|
| `--bg` | `bg` | `#fbfbf9` | `#15161b` |
| `--card` | `card` | `#ffffff` | `#1c1e24` |
| `--panel` | `panel` | `#f6f5f1` | `#191b21` |
| `--sunken` | `sunken` | `#f1efe9` | `#141519` |
| `--text` | `text` | `#111214` | `#eceded` |
| `--ink-2` | `ink-2` | `#2a2c30` | `#d4d7dc` |
| `--secondary` | `secondary` | `#6b6d72` | `#9aa0a8` |
| `--muted` | `muted` | `#9a9ca1` | `#6e747d` |
| `--border` | `border` | `#e6e5df` | `#2c2f37` |
| `--line-2` | `line-2` | `#ececea` | `#24272e` |
| `--line-strong` | `line-strong` | `#d6d5cf` | `#3b3f49` |
| `--positive` | `positive` | `#0a8f4e` | `#35c07a` |
| `--pos-soft` | `pos-soft` | `#dff1e6` | `rgba(53, 192, 122, 0.16)` |
| `--negative` | `negative` | `#c8341f` | `#f0705a` |
| `--neg-soft` | `neg-soft` | `#f7e0dc` | `rgba(240, 112, 90, 0.16)` |
| `--warn` | `warn` | `#b46b00` | `#dda23c` |
| `--warn-soft` | `warn-soft` | `#fbf0dc` | `rgba(221, 162, 60, 0.15)` |
| `--highlight` | `highlight` | `#eef4ff` | `#1e2433` |
| `--row-alt` | `row-alt` | `#fafaf7` | `#20232a` |
| `--blue` | `blue` | `#3457d5` | `#7a95ee` |
| `--accent-ink` | `accent-ink` | `#1a3ab8` | `#9db0f4` |
| `--c1` | `c1` | `#178b7d` | `#33b5a3` |
| `--c2` | `c2` | `#7b5fd0` | `#a78cf2` |
| `--c1-soft` | `c1-soft` | `rgba(23, 139, 125, 0.12)` | `rgba(51, 181, 163, 0.16)` |
| `--c2-soft` | `c2-soft` | `rgba(123, 95, 208, 0.12)` | `rgba(167, 140, 242, 0.16)` |
| `--on-accent` | `on-accent` | `#ffffff` | `#ffffff (same)` |


`--purple` (`#7259C7` light, `#a78cf2` dark) and `--amber` (`#B7791F` light, `#dda23c` dark) exist in `tokens.css` as CSS variables only, with no Tailwind class; use `var(--purple)` / `var(--amber)`.

Other tokens: fonts `--f-sans` / `--f-mono` (`font-sans`, `font-mono`); `--shadow` (`shadow-card`); `--shadow-modal`, `--shadow-pop`, `--shadow-lift`, `--scrim`, `--tooltip-bg`, `--tooltip-ink` (variables only; the tooltip is a dark chip in both themes).
