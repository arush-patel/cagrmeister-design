export type Figure = { label: string; value: string; sub?: string; tone?: "pos" | "neg" | "wrn" };

const TONE: Record<string, string> = { pos: "pos", neg: "neg", wrn: "wrn" };
const figureSlug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function FigureCell({ figure, headline }: { figure: Figure; headline?: boolean }) {
  return (
    <div
      className={headline ? "figure-band-headline" : "figure-band-cell"}
      data-testid={`fig-${figureSlug(figure.label)}`}
    >
      <div className="figure-band-cell-label">{figure.label}</div>
      <div className={`figure-band-value ${TONE[figure.tone ?? ""] ?? ""}`}>{figure.value}</div>
      <div className="figure-band-sub">{figure.sub ?? ""}</div>
    </div>
  );
}

export function FigureBand({ headline, figures }: { headline: Figure; figures: Figure[] }) {
  return (
    <section className="figure-band" data-testid="strip-figures">
      <FigureCell figure={headline} headline />
      <div className="figure-band-rule" aria-hidden="true" />
      <div className="figure-band-grid">
        {figures.map((f) => (
          <FigureCell key={f.label} figure={f} />
        ))}
      </div>
    </section>
  );
}
