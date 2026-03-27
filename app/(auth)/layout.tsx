export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--pine-50)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-offwhite text-sm font-bold flex-shrink-0"
            style={{ background: "var(--pine)" }}
          >
            PM
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--space)" }}>
            PM Copilot
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
