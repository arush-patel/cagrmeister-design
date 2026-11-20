// The theme choice, in three states.
//
// "system" is the DEFAULT and stamps nothing on <html>: in that state only prefers-color-scheme
// separates light from dark. An explicit "light" or "dark" stamps data-theme, and the CSS guards
// its media block with :not([data-theme="light"]) so an explicit light choice beats a dark OS.
//
// Every storage call is wrapped: a private window or blocked site data must not break the page.

export type ThemeChoice = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "cagrmeister:theme";
export const THEME_EVENT = "cagrmeister:theme";
export const LEGACY_THEME_KEYS = [
  "observatory:theme",
  "cagr-theme",
  "cagr-accounts-theme",
  "cagr-portfolio-theme",
] as const;

const CHOICES: readonly string[] = ["system", "dark", "light"];
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // An unreadable store reads as no choice, not as an error worth surfacing.
    return null;
  }
}

function readStored(): ThemeChoice {
  const v = readKey(THEME_STORAGE_KEY);
  return v !== null && CHOICES.includes(v) ? (v as ThemeChoice) : "system";
}

function writeStored(choice: ThemeChoice): void {
  try {
    if (choice === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // The stamp still applies for this page view; only persistence is lost.
  }
}

function stamp(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
}

export function currentTheme(): ThemeChoice {
  return readStored();
}

export function resolvedTheme(): ResolvedTheme {
  const choice = readStored();
  if (choice !== "system") return choice;
  try {
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function setTheme(next: string): ThemeChoice {
  const choice = (CHOICES.includes(next) ? next : "system") as ThemeChoice;
  writeStored(choice);
  stamp(choice);
  // Charts take hex, not tokens, so they cannot follow the cascade: they listen for this.
  try {
    document.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: choice } }));
  } catch {
    // A stub document without dispatchEvent is a test, not a browser.
  }
  return choice;
}

// Carry a choice saved under an older app's key over to the shared key, once.
function carryOverLegacy(): void {
  if (readKey(THEME_STORAGE_KEY) !== null) return;
  for (const key of LEGACY_THEME_KEYS) {
    const v = readKey(key);
    if (v === "light" || v === "dark") {
      writeStored(v);
      return;
    }
  }
}

export function initTheme(): ThemeChoice {
  carryOverLegacy();
  const choice = readStored();
  stamp(choice);
  return choice;
}

export function onThemeChange(fn: () => void): () => void {
  const hasDoc = typeof document !== "undefined";
  let mq: MediaQueryList | null = null;
  try {
    mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia(DARK_QUERY) : null;
  } catch {
    mq = null;
  }
  if (hasDoc) document.addEventListener(THEME_EVENT, fn);
  mq?.addEventListener("change", fn);
  return () => {
    if (hasDoc) document.removeEventListener(THEME_EVENT, fn);
    mq?.removeEventListener("change", fn);
  };
}
