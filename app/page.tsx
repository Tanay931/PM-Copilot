import Link from "next/link";

const features = [
  {
    title: "PRD Generator",
    description:
      "Describe your feature in plain English. Get a structured, stakeholder-ready PRD in seconds — complete with goals, user stories, and acceptance criteria.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    href: "/new-prd",
    cta: "Create a PRD",
    available: true,
  },
  {
    title: "Prototype Builder",
    description:
      "Turn your product ideas into clickable wireframes and prototypes without touching a design tool.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    href: "#",
    cta: "Coming soon",
    available: false,
  },
  {
    title: "User Story Writer",
    description:
      "Break epics into sprint-ready user stories with clear acceptance criteria, formatted for Jira, Linear, or any tool your team uses.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    href: "#",
    cta: "Coming soon",
    available: false,
  },
  {
    title: "Competitive Analysis",
    description:
      "Get structured competitive breakdowns instantly — positioning, feature gaps, and strategic insights for your next product decision.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    href: "#",
    cta: "Coming soon",
    available: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen px-10 py-14 max-w-4xl">
      {/* Hero */}
      <div className="mb-14">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
          style={{ background: "var(--pine-50)", color: "var(--pine)", borderColor: "var(--pine-100)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--pine)" }} />
          Now in beta
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-space mb-4 leading-[1.15]">
          Your AI co-pilot for
          <br />
          <span className="text-pine">product management</span>
        </h1>
        <p className="text-lg max-w-lg leading-relaxed" style={{ color: "#4a5568" }}>
          PM Copilot automates the time-consuming parts of your job — PRDs, user stories,
          prototypes, and competitive research — so you can focus on the decisions that matter.
        </p>
        <div className="mt-8">
          <Link
            href="/new-prd"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-offwhite transition-colors bg-pine hover:bg-pine-dark"
          >
            Start with a PRD
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mb-12" style={{ background: "var(--pine-100)" }} />

      {/* Features */}
      <div>
        <h2
          className="text-[11px] font-semibold uppercase tracking-widest mb-6"
          style={{ color: "var(--pine)" }}
        >
          What you can do
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative rounded-xl border p-6 transition-all ${
                feature.available
                  ? "border-pine-100 bg-white hover:shadow-md"
                  : "bg-white/60"
              }`}
              style={
                feature.available
                  ? { borderColor: "var(--pine-100)" }
                  : { borderColor: "#e5e7eb" }
              }
            >
              <div
                className="mb-4 w-9 h-9 rounded-lg flex items-center justify-center"
                style={
                  feature.available
                    ? { background: "var(--pine-50)", color: "var(--pine)" }
                    : { background: "#f3f4f6", color: "#9ca3af" }
                }
              >
                {feature.icon}
              </div>
              <h3
                className="font-semibold text-[15px] mb-1.5"
                style={{ color: feature.available ? "var(--space)" : "#9ca3af" }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: feature.available ? "#4a5568" : "#9ca3af" }}
              >
                {feature.description}
              </p>
              <div className="mt-5">
                {feature.available ? (
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors text-pine hover:text-pine-dark"
                  >
                    {feature.cta}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <span
                    className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md"
                    style={{ background: "#f3f4f6", color: "#9ca3af" }}
                  >
                    Coming soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info callout */}
      <div
        className="mt-12 rounded-xl px-6 py-5 flex items-start gap-4"
        style={{ background: "var(--sky)" }}
      >
        <div className="flex-shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0077b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-space mb-0.5">Built for BNGAI product teams</p>
          <p className="text-sm leading-relaxed" style={{ color: "#1d4e6e" }}>
            PM Copilot is an internal tool for accelerating product work. Add your Anthropic API key to <code className="text-xs bg-white/60 px-1.5 py-0.5 rounded font-mono">.env.local</code> to enable AI generation.
          </p>
        </div>
      </div>
    </div>
  );
}
