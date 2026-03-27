"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PRD {
  id: string;
  title: string;
  content_markdown: string | null;
  status: "draft" | "complete";
  created_at: string;
  updated_at: string;
  product: { name: string } | null;
}

export default function PRDViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [prd, setPrd] = useState<PRD | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/prds/${id}`);
      if (res.status === 404) { setNotFound(true); setLoading(false); return; }
      if (!res.ok) { setLoading(false); return; }
      const { data } = await res.json();
      setPrd(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this PRD? This cannot be undone.")) return;
    await fetch(`/api/prds/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  async function handleDownload() {
    const res = await fetch(`/api/prds/${id}/download`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prd?.title ?? "PRD"}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen px-10 py-14">
        <div className="h-8 w-64 rounded-lg animate-pulse mb-4" style={{ background: "var(--pine-50)" }} />
        <div className="h-96 w-full max-w-3xl rounded-xl animate-pulse" style={{ background: "var(--pine-50)" }} />
      </div>
    );
  }

  if (notFound || !prd) {
    return (
      <div className="min-h-screen px-10 py-14 flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--space)" }}>PRD not found</h1>
        <p style={{ color: "#9ca3af" }}>This PRD may have been deleted or the link is invalid.</p>
        <Link href="/dashboard" className="text-sm font-semibold" style={{ color: "var(--pine)" }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-10 py-14">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link href="/dashboard" className="text-xs font-medium" style={{ color: "var(--pine)" }}>
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight" style={{ color: "var(--space)" }}>
            {prd.title}
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            {prd.product && (
              <span className="text-xs" style={{ color: "#6b7280" }}>{prd.product.name}</span>
            )}
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
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
            style={{ borderColor: "var(--pine-100)", color: "var(--pine)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download .docx
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
            style={{ borderColor: "#fca5a5", color: "#dc2626" }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Markdown content */}
      {prd.content_markdown ? (
        <div className="max-w-3xl">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-8 mb-4" style={{ color: "var(--pine)" }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mt-7 mb-3 pb-2" style={{ color: "var(--pine)", borderBottom: "1px solid var(--pine-100)" }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-bold mt-5 mb-2" style={{ color: "var(--space)" }}>{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--space)" }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="text-sm mb-3 pl-5 space-y-1" style={{ color: "var(--space)", listStyleType: "disc" }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="text-sm mb-3 pl-5 space-y-1" style={{ color: "var(--space)", listStyleType: "decimal" }}>{children}</ol>
              ),
              li: ({ children }) => <li>{children}</li>,
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm border-collapse">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left text-xs font-semibold text-offwhite" style={{ background: "var(--pine)" }}>{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-sm border-b" style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}>{children}</td>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "var(--pine-50)", color: "var(--pine)" }}>{children}</code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 pl-4 my-3" style={{ borderColor: "var(--pine)", background: "var(--sky)" }}>{children}</blockquote>
              ),
            }}
          >
            {prd.content_markdown}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm" style={{ color: "#9ca3af" }}>
          This PRD has no content yet.{" "}
          <Link href="/prds/new" className="font-semibold" style={{ color: "var(--pine)" }}>
            Continue in the PRD generator
          </Link>
        </p>
      )}
    </div>
  );
}
