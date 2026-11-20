import type { ReactNode } from "react";

export function InstrumentBar({
  title,
  sub,
  subTestId,
  controls,
}: {
  title: string;
  sub: string;
  /** Puts the test id on the visible sub — never on a hidden duplicate. */
  subTestId?: string;
  /** Omit for the empty-controls note. Pass null when this strip has no right-hand control. */
  controls?: ReactNode | null;
}) {
  const controlsNode = controls === undefined
    ? <span className="instrument-bar-empty">— no tab controls —</span>
    : controls
      ? <div className="instrument-bar-controls">{controls}</div>
      : null;
  return (
    <section className="instrument-bar" data-testid="strip-instrument">
      <span className="instrument-bar-title">{title}</span>
      <span className="instrument-bar-sub" {...(subTestId ? { "data-testid": subTestId } : {})}>{sub}</span>
      {controlsNode}
    </section>
  );
}
