// The mapping decisions. Extend only with the owner.
// PAIRS is keyed "<light utility>|<dark utility>"; SINGLES has no dark partner.

const PAIR_GROUPS = [
  ["text-text", ["text-gray-900|text-gray-100", "text-black|text-gray-100"]],
  ["text-ink-2", ["text-gray-800|text-gray-200", "text-gray-700|text-gray-200", "text-gray-700|text-gray-300"]],
  ["text-secondary", ["text-gray-600|text-gray-300", "text-gray-600|text-gray-400"]],
  ["text-muted", ["text-gray-500|text-gray-400", "text-gray-400|text-gray-500", "text-gray-400|text-gray-400", "text-gray-300|text-gray-600"]],
  ["bg-card", ["bg-white|bg-gray-950", "bg-white|bg-gray-900"]],
  ["bg-bg", ["bg-gray-50|bg-gray-950"]],
  ["bg-panel", ["bg-gray-50|bg-gray-900/40", "bg-gray-50|bg-gray-900/30", "bg-gray-100|bg-gray-900/40", "bg-gray-100|bg-gray-900", "bg-gray-100|bg-gray-800"]],
  ["bg-sunken", ["bg-gray-200|bg-gray-900", "bg-gray-200|bg-gray-800"]],
  ["border-border", ["border-gray-200|border-gray-800", "border-gray-200|border-gray-700", "border-gray-200|border-gray-600"]],
  ["border-line-2", ["border-gray-100|border-gray-800"]],
  ["border-line-strong", ["border-gray-300|border-gray-700", "border-gray-300|border-gray-600", "border-gray-300|border-gray-800"]],
  ["placeholder:text-muted", ["placeholder-gray-400|placeholder-gray-500"]],
  ["text-accent-ink", ["text-blue-700|text-blue-200", "text-blue-800|text-blue-200"]],
  ["bg-highlight", ["bg-blue-50|bg-blue-950/30"]],
  ["text-negative", ["text-red-600|text-red-400", "text-red-700|text-red-200"]],
  ["bg-blue", ["bg-blue-600|bg-blue-500"]],
];

const SINGLE_GROUPS = [
  ["text-text", ["text-gray-900", "text-black"]],
  ["text-ink-2", ["text-gray-800", "text-gray-700"]],
  ["text-secondary", ["text-gray-600"]],
  ["text-muted", ["text-gray-500", "text-gray-400"]],
  ["text-on-accent", ["text-white"]],
  ["bg-card", ["bg-white"]],
  ["bg-panel", ["bg-gray-50", "bg-gray-100"]],
  ["bg-sunken", ["bg-gray-200"]],
  ["border-border", ["border-gray-200"]],
  ["border-line-2", ["border-gray-100"]],
  ["border-line-strong", ["border-gray-300"]],
  ["placeholder:text-muted", ["placeholder-gray-400"]],
  ["text-blue", ["text-blue-600"]],
  ["text-accent-ink", ["text-blue-700"]],
  ["bg-blue", ["bg-blue-600"]],
  ["border-blue", ["border-blue-600"]],
  ["bg-highlight", ["bg-blue-50"]],
  ["text-negative", ["text-red-500", "text-red-600", "text-red-700"]],
  ["bg-neg-soft", ["bg-red-50"]],
  ["bg-negative", ["bg-red-600"]],
  ["text-positive", ["text-green-600", "text-green-700"]],
  ["bg-pos-soft", ["bg-green-50", "bg-green-100"]],
  ["bg-positive", ["bg-green-600"]],
  ["text-warn", ["text-amber-600", "text-amber-700", "text-orange-600", "text-yellow-700"]],
  ["bg-warn-soft", ["bg-amber-50", "bg-orange-50", "bg-yellow-50"]],
];

const flatten = (groups) =>
  Object.fromEntries(groups.flatMap(([to, froms]) => froms.map((from) => [from, to])));

export const PAIRS = flatten(PAIR_GROUPS);
export const SINGLES = flatten(SINGLE_GROUPS);
