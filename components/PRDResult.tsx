"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownToDocxBlob } from "@/lib/generate-docx";
import { useState } from "react";

interface PRDResultProps {
  markdown: string;
  productName: string;
  featureName: string;
  targetRelease: string;
  onReset: () => void;
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export default function PRDResult({
  markdown, productName, featureName, targetRelease, onReset,
}: PRDResultProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const docTitle = [featureName, productName].filter(Boolean).join(" · ");

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await markdownToDocxBlob(markdown, docTitle);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(featureName || productName || "prd").replace(/\s+/g, "-").toLowerCase()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{
                background: "rgba(166,255,163,0.2)",
                color: "var(--pine)",
                borderColor: "var(--mint)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "var(--pine)" }}
              />
              PRD generated
            </span>
          </div>
          <p className="text-sm" style={{ color: "#4a5568" }}>
            {[productName, featureName, targetRelease].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-pine-50"
            style={{ color: "#4a5568", borderColor: "var(--pine-100)" }}
          >
            <ResetIcon />
            New PRD
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-pine-50"
            style={{ color: "#4a5568", borderColor: "var(--pine-100)" }}
          >
            <CopyIcon copied={copied} />
            {copied ? "Copied" : "Copy markdown"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-offwhite transition-colors bg-pine hover:bg-pine-dark disabled:opacity-60"
          >
            <DownloadIcon />
            {downloading ? "Exporting…" : "Download .docx"}
          </button>
        </div>
      </div>

      {/* PRD document */}
      <div
        className="rounded-xl border bg-white px-12 py-10 shadow-sm"
        style={{ borderColor: "var(--pine-100)" }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-0 mb-2 leading-tight" style={{ color: "var(--space)" }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className="text-[17px] font-semibold mt-10 mb-3 pb-2.5 first:mt-0"
                style={{ color: "var(--pine)", borderBottom: "1px solid var(--pine-100)" }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-[15px] font-semibold mt-6 mb-2" style={{ color: "var(--space)" }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-[15px] leading-relaxed mb-4" style={{ color: "#374151" }}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="my-3 space-y-1.5 pl-0">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-3 space-y-1.5 list-decimal pl-5">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2 text-[15px] leading-relaxed list-none" style={{ color: "#374151" }}>
                <span
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--mint-dark)" }}
                />
                <span>{children}</span>
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold" style={{ color: "var(--space)" }}>{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic" style={{ color: "#4a5568" }}>{children}</em>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.includes("language-");
              if (isBlock) {
                return (
                  <code
                    className="block rounded-lg px-4 py-3 text-sm font-mono my-4 overflow-x-auto whitespace-pre"
                    style={{ background: "var(--pine-50)", border: "1px solid var(--pine-100)", color: "var(--space)" }}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <code
                  className="text-[13px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: "var(--pine-50)", color: "var(--pine)" }}
                >
                  {children}
                </code>
              );
            },
            blockquote: ({ children }) => (
              <blockquote
                className="pl-4 my-4 italic"
                style={{ borderLeft: "2px solid var(--mint)", color: "#4a5568" }}
              >
                {children}
              </blockquote>
            ),
            hr: () => (
              <hr className="my-8" style={{ borderColor: "var(--pine-100)" }} />
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="underline underline-offset-2 transition-colors hover:opacity-80"
                style={{ color: "var(--pine)" }}
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="w-full text-sm border-collapse">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th
                className="text-left px-3 py-2 font-semibold text-[13px]"
                style={{ background: "var(--pine-50)", border: "1px solid var(--pine-100)", color: "var(--space)" }}
              >
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td
                className="px-3 py-2 text-[13px]"
                style={{ border: "1px solid var(--pine-100)", color: "#374151" }}
              >
                {children}
              </td>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
