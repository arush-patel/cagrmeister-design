import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  sub?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Bordered body block with a panel head — title (caps), muted sub, right-aligned meta. */
export function Panel({ title, sub, meta, children, className }: PanelProps) {
  return (
    <section className={`ui-panel${className ? ` ${className}` : ""}`} data-testid="ui-panel">
      <header className="ui-panel-head">
        <span className="ui-panel-title">{title}</span>
        {sub ? <span className="ui-panel-sub">{sub}</span> : null}
        {meta ? <span className="ui-panel-meta">{meta}</span> : null}
      </header>
      <div className="ui-panel-body">{children}</div>
    </section>
  );
}
