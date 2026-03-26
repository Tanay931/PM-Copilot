"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProducts } from "@/lib/products-store";

// ─── Nav structure ────────────────────────────────────────────────────────────

const toolsNav = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    label: "New PRD",
    href: "/new-prd",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </svg>
    ),
  },
];

const comingSoon = ["Prototype Builder", "User Stories", "Competitive Analysis"];

// ─── Shared nav link component ────────────────────────────────────────────────

function NavLink({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string | number;
}) {
  return (
    <Link
      href={href}
      style={
        active
          ? { background: "rgba(166,255,163,0.15)", color: "var(--mint)" }
          : { color: "var(--sidebar-text)" }
      }
      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-white/10 hover:text-offwhite"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: "rgba(166,255,163,0.2)", color: "var(--mint)" }}
        >
          {badge}
        </span>
      )}
      {active && (
        <span
          className="ml-auto w-1 h-1 rounded-full flex-shrink-0"
          style={{ background: "var(--mint)" }}
        />
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest"
      style={{ color: "rgba(252,253,253,0.3)" }}
    >
      {children}
    </p>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const { products } = useProducts();

  const isProductsActive =
    pathname === "/products" || pathname.startsWith("/products/");

  return (
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-30 bg-pine"
      style={{ borderRight: "1px solid var(--pine-dark)" }}
    >
      {/* Brand */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(252,253,253,0.1)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-pine text-[13px] tracking-tight"
            style={{ background: "var(--mint)" }}
          >
            BN
          </div>
          <div>
            <p className="text-[13px] font-bold text-offwhite tracking-wide leading-none">BNGAI</p>
            <p className="text-[11px] mt-0.5 leading-none" style={{ color: "var(--sidebar-text)" }}>
              PM Copilot
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {/* Tools */}
        <div>
          <SectionLabel>Tools</SectionLabel>
          <div className="space-y-0.5">
            {toolsNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
              />
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <SectionLabel>Products</SectionLabel>
          <div className="space-y-0.5">
            <NavLink
              href="/products"
              active={isProductsActive}
              badge={products.length > 0 ? products.length : undefined}
              label="My Products"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
            />
            <NavLink
              href="/products/new"
              active={pathname === "/products/new"}
              label="Add Product"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Coming soon */}
        <div>
          <SectionLabel>Coming Soon</SectionLabel>
          <div className="space-y-0.5">
            {comingSoon.map((label) => (
              <div
                key={label}
                className="flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-default"
                style={{ color: "rgba(252,253,253,0.25)" }}
              >
                <span>{label}</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide"
                  style={{ background: "rgba(252,253,253,0.07)", color: "rgba(252,253,253,0.25)" }}
                >
                  soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(252,253,253,0.1)" }}>
        <p className="text-[11px]" style={{ color: "rgba(252,253,253,0.3)" }}>
          v0.1 · BNGAI
        </p>
      </div>
    </aside>
  );
}
