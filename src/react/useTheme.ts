import { useSyncExternalStore } from "react";
import {
  currentTheme,
  onThemeChange,
  resolvedTheme,
  setTheme,
  type ResolvedTheme,
  type ThemeChoice,
} from "../theme.js";

export function useTheme(): {
  choice: ThemeChoice;
  resolved: ResolvedTheme;
  setChoice: (c: ThemeChoice) => void;
} {
  // One string snapshot, so the store compares by value and never loops.
  const snap = useSyncExternalStore(
    onThemeChange,
    () => `${currentTheme()}|${resolvedTheme()}`,
    () => "system|light",
  );
  const [choice, resolved] = snap.split("|") as [ThemeChoice, ResolvedTheme];
  return { choice, resolved, setChoice: (c) => void setTheme(c) };
}
