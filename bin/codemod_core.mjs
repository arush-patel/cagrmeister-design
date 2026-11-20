// Pure logic for cagr-design-codemod: rewrites paired light/dark Tailwind classes into token classes.
import { parse } from "@babel/parser";
import { PAIRS, SINGLES } from "./class_map.mjs";
import { isFlaggedClass } from "./check_core.mjs";

// property (utility up to its colour, side suffix included), colour, optional alpha
const UTILITY_RE =
  /^((?:bg|text|border(?:-[trblxy])?|ring|divide|outline|fill|stroke|placeholder|from|via|to|shadow|accent|caret|decoration))-((?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}))(?:\/(\d+))?$/;

function parseToken(raw) {
  const parts = raw.split(":");
  const utility = parts.pop();
  const m = UTILITY_RE.exec(utility);
  const rest = [];
  let mode = "base";
  for (const v of parts) {
    if (v === "app-light") mode = "light";
    else if (v === "app-dark") mode = "dark";
    else rest.push(v);
  }
  return {
    raw,
    mode,
    variants: rest.join(":"),
    property: m ? m[1] : null,
    colour: m ? m[2] : null,
    alpha: m ? m[3] ?? null : null,
  };
}

// "border-b" + "border-border" -> "border-b-border"; other properties have no suffix.
function withSide(property, mapped) {
  if (!property.startsWith("border-")) return mapped;
  return property + mapped.slice("border".length);
}

function baseOf(property) {
  return property.startsWith("border-") ? "border" : property;
}

function lookupKey(t, alphaStripped) {
  return `${baseOf(t.property)}-${t.colour}${alphaStripped || !t.alpha ? "" : `/${t.alpha}`}`;
}

function result(t, mapped, alpha) {
  const cls = withSide(t.property, mapped) + (alpha ? `/${alpha}` : "");
  return t.variants ? `${t.variants}:${cls}` : cls;
}

/** Rewrites one run of class text. Returns the new text; pushes to counts/unmapped. */
function rewriteChunk(text, glued, stats) {
  const spans = [...text.matchAll(/\S+/g)].map((m) => ({
    start: m.index,
    end: m.index + m[0].length,
    raw: m[0],
    // a token touching a `${` can't be judged on its own
    skip:
      (glued.leading && m.index === 0) || (glued.trailing && m.index + m[0].length === text.length),
  }));
  const toks = spans.map((s) => ({ ...s, ...parseToken(s.raw), out: s.raw, drop: false }));

  for (const t of toks) {
    if (t.skip || t.mode === "dark" || !t.property) continue;
    const partner = toks.find(
      (d) => d !== t && !d.skip && !d.drop && d.mode === "dark" && d.property &&
        d.variants === t.variants && d.property === t.property && !d.paired,
    );
    if (partner) {
      const sameAlpha = t.alpha !== null && t.alpha === partner.alpha;
      // same alpha on both: strip, look up, re-append; otherwise look up exactly as written
      const key = `${lookupKey(t, sameAlpha)}|${lookupKey(partner, sameAlpha)}`;
      const mapped = PAIRS[key];
      if (mapped) {
        t.out = result(t, mapped, sameAlpha ? t.alpha : null);
        partner.drop = true;
        partner.paired = true;
        stats.replaced++;
      }
      continue; // a partner exists: pair or leave both, never a single
    }
    const mapped = SINGLES[lookupKey(t, true)];
    if (mapped) {
      t.out = result(t, mapped, t.alpha);
      stats.replaced++;
    }
  }

  for (const t of toks) {
    if (!t.drop && t.out === t.raw && !t.skip && isFlaggedClass(t.raw)) stats.unmapped.push(t.raw);
  }

  let out = "";
  let cursor = 0;
  for (const t of toks) {
    const gap = text.slice(cursor, t.start);
    cursor = t.end;
    if (t.drop) continue;
    out += gap + t.out;
  }
  out += text.slice(cursor);
  if (toks.length && toks[0].drop && !/^\s/.test(text)) out = out.replace(/^\s+/, "");
  return out;
}

function collect(node, found) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const n of node) collect(n, found);
    return;
  }
  if (node.type === "StringLiteral" || node.type === "TemplateElement") found.push(node);
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "extra") continue;
    collect(node[key], found);
  }
}

export function rewriteClasses(source) {
  const ast = parse(source, { sourceType: "module", plugins: ["jsx", "typescript"] });
  const nodes = [];
  collect(ast.program, nodes);
  nodes.sort((a, b) => a.start - b.start);

  const stats = { replaced: 0, unmapped: [] };
  const edits = [];
  for (const node of nodes) {
    const isString = node.type === "StringLiteral";
    const start = isString ? node.start + 1 : node.start;
    const end = isString ? node.end - 1 : node.end;
    const text = source.slice(start, end);
    const glued = isString
      ? {}
      : { leading: source[node.start - 1] === "}", trailing: source.slice(node.end, node.end + 2) === "${" };
    const out = rewriteChunk(text, glued, stats);
    if (out !== text) edits.push({ start, end, out });
  }
  let code = source;
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    code = code.slice(0, e.start) + e.out + code.slice(e.end);
  }
  return { code, replaced: stats.replaced, unmapped: stats.unmapped };
}
