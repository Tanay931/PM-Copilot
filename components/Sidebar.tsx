"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function NavLink({
  href,
  icon,
  label,
  active,
  badge,
  disabled,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div
        className="flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-default"
        style={{ color: "rgba(252,253,253,0.25)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex-shrink-0">{icon}</span>
          <span>{label}</span>
        </div>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide"
          style={{ background: "rgba(252,253,253,0.07)", color: "rgba(252,253,253,0.25)" }}
        >
          soon
        </span>
      </div>
    );
  }

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
      {badge !== undefined && badge > 0 && (
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? null);

      const { data: profile } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();
      setUserName(profile?.name ?? null);

      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setProductCount(count ?? 0);
    }
    load();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isProductsActive = pathname === "/products" || pathname.startsWith("/products/");
  const isPrdsActive = pathname.startsWith("/prds");

  return (
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-30"
      style={{ background: "var(--pine)", borderRight: "1px solid var(--pine-dark)" }}
    >
      {/* Brand */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(252,253,253,0.1)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-pine text-[13px] tracking-tight"
            style={{ background: "var(--mint)" }}
          >
            PM
          </div>
          <div>
            <p className="text-[13px] font-bold text-offwhite tracking-wide leading-none">PM Copilot</p>
            <p className="text-[11px] mt-0.5 leading-none" style={{ color: "var(--sidebar-text)" }}>
              by BNGAI
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
            <NavLink
              href="/dashboard"
              active={pathname === "/dashboard"}
              label="Dashboard"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              }
            />
            <NavLink
              href="/prds/new"
              active={pathname === "/prds/new"}
              label="New PRD"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              }
            />
            <NavLink
              href="/prototypes"
              active={false}
              disabled
              label="Prototypes"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Products */}
        <div>
          <SectionLabel>Products</SectionLabel>
          <div className="space-y-0.5">
            <NavLink
              href="/products"
              active={isProductsActive}
              badge={productCount}
              label="My Products"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
            />
          </div>
        </div>
      </nav>

      {/* User profile + logout */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(252,253,253,0.1)" }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: "rgba(166,255,163,0.2)", color: "var(--mint)" }}
          >
            {(userName ?? userEmail ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {userName && (
              <p className="text-xs font-semibold truncate text-offwhite">{userName}</p>
            )}
            {userEmail && (
              <p className="text-[11px] truncate" style={{ color: "var(--sidebar-text)" }}>
                {userEmail}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-white/10"
          style={{ color: "var(--sidebar-text)" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
