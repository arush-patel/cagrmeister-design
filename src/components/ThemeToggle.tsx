import type { ReactNode } from "react";
import { useTheme } from "../react/useTheme.js";
import type { ThemeChoice } from "../theme.js";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Three-way appearance control: light, dark or match the system. */
export function ThemeToggle() {
  const { choice, setChoice } = useTheme();
  const pick = (next: ThemeChoice) => setChoice(next);
  return (
    <div className="hdr-theme" role="group" aria-label="Appearance">
      <button type="button" className="hdr-theme-seg" title="Light" aria-label="Light" aria-pressed={choice === "light"} onClick={() => pick("light")}>
        <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></Icon>
      </button>
      <button type="button" className="hdr-theme-seg" title="Dark" aria-label="Dark" aria-pressed={choice === "dark"} onClick={() => pick("dark")}>
        <Icon><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></Icon>
      </button>
      <button type="button" className="hdr-theme-seg" title="Match system" aria-label="Match system" aria-pressed={choice === "system"} onClick={() => pick("system")}>
        <Icon><rect width="20" height="14" x="2" y="3" rx="2" /><path d="M8 21h8M12 17v4" /></Icon>
      </button>
    </div>
  );
}
