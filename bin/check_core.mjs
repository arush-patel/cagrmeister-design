// Pure logic for cagr-design-check: finds off-system colours in source text.

const COLOURS =
  "white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}";
const PALETTE_RE = new RegExp(
  `^(?:bg|text|border(?:-[trblxy])?|ring|divide|outline|fill|stroke|placeholder|from|via|to|shadow|accent|caret|decoration)-(?:${COLOURS})(?:\\/\\d+)?$`,
);
const GRADIENT_RE = /^bg-(?:gradient|linear)-/;
const HEX_LITERAL_RE = /(["'`])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\1/g;
const HEX_ARBITRARY_RE = /\[#[0-9a-fA-F]+\]/g;
const TOKEN_RE = /[^\s"'`{}()<>,;=]+/g;
const DESIGN_OK_RE = /\/\/\s*design-ok\s*$/;

/** The utility of a class token: what follows its last variant prefix. */
const utilityOf = (token) => token.slice(token.lastIndexOf(":") + 1);

export const isPaletteClass = (token) => PALETTE_RE.test(utilityOf(token));
export const isThemeVariant = (token) =>
  token.includes("app-light:") || token.includes("app-dark:") || token.startsWith("dark:");
export const isGradient = (token) => GRADIENT_RE.test(utilityOf(token));
/** True for a class token that checkSource would report as a palette class or theme variant. */
export const isFlaggedClass = (token) => isPaletteClass(token) || isThemeVariant(token);

export function checkSource(source, opts = {}) {
  const hex = opts.hex !== false;
  const findings = [];
  source.split("\n").forEach((text, i) => {
    if (DESIGN_OK_RE.test(text)) return;
    const line = i + 1;
    for (const [token] of text.matchAll(TOKEN_RE)) {
      if (isPaletteClass(token)) findings.push({ line, rule: "palette-class", token });
      if (isThemeVariant(token)) findings.push({ line, rule: "theme-variant", token });
      if (isGradient(token)) findings.push({ line, rule: "gradient", token });
    }
    if (hex) {
      for (const [match] of text.matchAll(HEX_LITERAL_RE)) {
        findings.push({ line, rule: "hex-colour", token: match.slice(1, -1) });
      }
      for (const [match] of text.matchAll(HEX_ARBITRARY_RE)) {
        findings.push({ line, rule: "hex-colour", token: match });
      }
    }
  });
  return findings;
}
