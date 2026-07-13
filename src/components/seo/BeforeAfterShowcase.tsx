export interface CaseItem {
  procedure: string;
  complexity: "Straightforward" | "Moderate" | "Complex" | "Full-mouth";
  outcome: string;
  beforeAlt: string;
  afterAlt: string;
  beforeSrc?: string;
  afterSrc?: string;
}

interface BeforeAfterShowcaseProps {
  heading?: string;
  intro?: string;
  cases: CaseItem[];
}

const complexityStyles: Record<CaseItem["complexity"], string> = {
  "Straightforward": "bg-emerald-100 text-emerald-800",
  "Moderate": "bg-amber-100 text-amber-800",
  "Complex": "bg-orange-100 text-orange-800",
  "Full-mouth": "bg-rose-100 text-rose-800",
};

/**
 * Clean "Before & After" case showcase. Uses placeholder assets by default
 * so real patient photos can be swapped in from the CMS later without
 * changing structure.
 */
const BeforeAfterShowcase = ({
  heading = "Real Patient Transformations",
  intro = "A selection of recent cases treated at our Garia clinic. Placeholder visuals shown to protect patient privacy — actual case photographs available in-clinic during consultation.",
  cases,
}: BeforeAfterShowcaseProps) => {
  return (
    <section className="section-padding bg-dental-surface">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#1A365D]/70">
            Case Showcase
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-heading font-bold text-[#1A365D]">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{intro}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <article
              key={i}
              className="rounded-xl overflow-hidden bg-background shadow-md ring-1 ring-border hover:shadow-lg transition"
            >
              <div className="grid grid-cols-2">
                <figure className="relative">
                  <img
                    src={c.beforeSrc ?? "/placeholder.svg"}
                    alt={c.beforeAlt}
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-40 md:h-48 object-cover bg-muted"
                  />
                  <figcaption className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                    Before
                  </figcaption>
                </figure>
                <figure className="relative">
                  <img
                    src={c.afterSrc ?? "/placeholder.svg"}
                    alt={c.afterAlt}
                    width={400}
                    height={300}
                    loading="lazy"
                    className="w-full h-40 md:h-48 object-cover bg-muted"
                  />
                  <figcaption className="absolute left-2 top-2 rounded bg-dental-green px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                    After
                  </figcaption>
                </figure>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-[#1A365D]">
                    {c.procedure}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${complexityStyles[c.complexity]}`}
                  >
                    {c.complexity}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.outcome}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterShowcase;
