export default function PrototypesPage() {
  return (
    <div className="min-h-screen px-10 py-14 flex flex-col items-center justify-center text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: "var(--pine-50)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--space)" }}>
        Prototypes — Coming Soon
      </h1>
      <p className="text-base max-w-md" style={{ color: "#6b7280" }}>
        Generate interactive prototypes directly from your PRDs. We&apos;re building this feature — check back soon.
      </p>
    </div>
  );
}
