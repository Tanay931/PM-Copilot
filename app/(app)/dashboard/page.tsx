"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  name: string | null;
}

interface PRDCard {
  id: string;
  title: string;
  status: "draft" | "complete";
  created_at: string;
  updated_at: string;
  product: { name: string } | null;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [prds, setPrds] = useState<PRDCard[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [profileRes, prdsRes, productsRes] = await Promise.all([
        supabase.from("users").select("name").eq("id", authUser.id).single(),
        supabase
          .from("prds")
          .select("id, title, status, created_at, updated_at, product:products(name)")
          .eq("user_id", authUser.id)
          .order("updated_at", { ascending: false })
          .returns<PRDCard[]>(),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("user_id", authUser.id),
      ]);

      setUser(profileRes.data);
      setPrds(prdsRes.data ?? []);
      setProductCount(productsRes.count ?? 0);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const filtered = prds.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.product?.name ?? "").toLowerCase().includes(q)
    );
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  if (loading) {
    return (
      <div className="min-h-screen px-10 py-14">
        <div className="h-8 w-64 rounded-lg animate-pulse mb-10" style={{ background: "var(--pine-50)" }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-xl animate-pulse" style={{ background: "var(--pine-50)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-10 py-14">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--space)" }}>
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 text-base" style={{ color: "#4a5568" }}>
            Your generated PRDs and artefacts appear here.
          </p>
        </div>
        <Link
          href="/prds/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-offwhite transition-colors flex-shrink-0"
          style={{ background: "var(--pine)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New PRD
        </Link>
      </div>

      {prds.length === 0 && productCount === 0 ? (
        /* First-time empty state */
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/products/new"
            className="flex-1 rounded-2xl border-2 border-dashed p-8 flex flex-col gap-3 transition-colors group"
            style={{ borderColor: "var(--pine-100)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "var(--pine-50)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: "var(--space)" }}>
                Set up your first product
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
                Add context, knowledge base docs, and user personas for richer PRDs.
              </p>
            </div>
            <span className="text-sm font-semibold mt-1" style={{ color: "var(--pine)" }}>
              Get started →
            </span>
          </Link>

          <div
            className="flex-1 rounded-2xl border-2 border-dashed p-8 flex flex-col gap-3 opacity-60 cursor-not-allowed"
            style={{ borderColor: "var(--pine-100)" }}
            title="Set up a product first"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "var(--pine-50)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-base" style={{ color: "var(--space)" }}>
                Generate your first PRD
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
                Set up a product first to unlock AI-powered PRD generation.
              </p>
            </div>
            <span className="text-sm font-semibold mt-1" style={{ color: "#9ca3af" }}>
              Set up a product first
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PRDs…"
                className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              No PRDs match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((prd) => (
                <Link
                  key={prd.id}
                  href={`/prds/${prd.id}`}
                  className="rounded-xl border p-5 flex flex-col gap-3 transition-colors hover:border-pine group"
                  style={{ borderColor: "var(--pine-100)", background: "#fff" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--pine-50)",
                        color: "var(--pine)",
                      }}
                    >
                      PRD
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: prd.status === "complete" ? "#dcfce7" : "var(--pine-50)",
                        color: prd.status === "complete" ? "#16a34a" : "#6b7280",
                      }}
                    >
                      {prd.status === "complete" ? "Complete" : "Draft"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--space)" }}>
                      {prd.title}
                    </h3>
                    {prd.product && (
                      <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                        {prd.product.name}
                      </p>
                    )}
                  </div>
                  <p className="text-xs mt-auto" style={{ color: "#9ca3af" }}>
                    {new Date(prd.updated_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {productCount === 0 && (
            <div
              className="mt-8 rounded-xl border p-5 flex items-center gap-4"
              style={{ borderColor: "var(--pine-100)", background: "var(--pine-50)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--pine)" }}>
                  Set up a product to unlock richer PRDs
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                  Add context, knowledge base docs, and personas.
                </p>
              </div>
              <Link
                href="/products/new"
                className="text-sm font-semibold flex-shrink-0"
                style={{ color: "var(--pine)" }}
              >
                Add product →
              </Link>
            </div>
          )}
        </>
      )}

      {/* Prototypes placeholder */}
      <div
        className="mt-10 rounded-xl border-2 border-dashed p-6 flex items-center gap-4 opacity-60"
        style={{ borderColor: "var(--pine-100)" }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--pine-50)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--space)" }}>
            Prototypes — Coming Soon
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
            Generate interactive prototypes from your PRDs.
          </p>
        </div>
      </div>
    </div>
  );
}
