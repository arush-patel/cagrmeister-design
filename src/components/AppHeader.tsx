import type { ReactNode } from "react";

/** The brand bar: logo at the left; today's date and any children (a profile menu) at the right. */
export function AppHeader({
  logoSrc,
  logoAlt = "CAGRMEISTER",
  showDate = true,
  children,
}: {
  logoSrc: string;
  logoAlt?: string;
  showDate?: boolean;
  children?: ReactNode;
}) {
  const now = new Date();
  return (
    <header className="shell-brand" data-testid="shell-brand">
      <img className="hdr-logo" src={logoSrc} alt={logoAlt} />
      <div className="hdr-end">
        {showDate && (
          <time className="hdr-date" dateTime={now.toISOString().slice(0, 10)}>{now.toDateString()}</time>
        )}
        {children}
      </div>
    </header>
  );
}
