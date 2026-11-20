// Read a CSS custom property's current value, for consumers (charts) that need a literal colour.
export function tokenValue(name: string, fallback = ""): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
