"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProductListItem, DBProductWithRelations, DBPersona } from "@/lib/types";
import PRDResult from "@/components/PRDResult";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile { id: string; file: File; }

interface FormState {
  context: string;
  files: UploadedFile[];
  productName: string;
  featureName: string;
  targetRelease: string;
}

type View = "product-selection" | "form" | "generating" | "result";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain", "image/png", "image/jpeg", "image/jpg",
];
const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg";

// ─── Small shared icons ───────────────────────────────────────────────────────

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ─── PRODUCT SELECTION VIEW ───────────────────────────────────────────────────

function ProductSelectCard({
  product,
  onSelect,
}: {
  product: ProductListItem;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="group text-left w-full rounded-xl border bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none"
      style={{ borderColor: "var(--pine-100)", borderLeft: "3px solid var(--pine)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="font-semibold text-space text-[15px] leading-snug">{product.name}</span>
        <span
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--pine)" }}
        >
          <ArrowRight />
        </span>
      </div>
      {product.short_description ? (
        <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: "#4a5568" }}>
          {product.short_description}
        </p>
      ) : (
        <p className="text-sm mb-3 italic" style={{ color: "#9ca3af" }}>No description</p>
      )}
      <div className="flex items-center gap-3">
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: product.persona_count > 0 ? "var(--pine)" : "#9ca3af" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {product.persona_count} persona{product.persona_count !== 1 ? "s" : ""}
        </span>
        <span
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: product.kb_item_count > 0 ? "var(--pine)" : "#9ca3af" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          {product.kb_item_count} KB item{product.kb_item_count !== 1 ? "s" : ""}
        </span>
      </div>
    </button>
  );
}

function ProductSelectionView({
  products,
  onSelect,
  onSkip,
}: {
  products: ProductListItem[];
  onSelect: (id: string) => void;
  onSkip: () => void;
}) {
  return (
    <div className="min-h-screen px-10 py-14 max-w-3xl">
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--pine)" }}>
        PRD Generator
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-space mb-2">
        Which product is this PRD for?
      </h1>
      <p className="text-base leading-relaxed mb-10" style={{ color: "#4a5568" }}>
        Select a product to pull in its context, knowledge base, and personas — so your PRD is grounded in real product knowledge.
      </p>

      {products.length === 0 ? (
        <div
          className="text-center py-14 rounded-2xl border-2 border-dashed mb-8"
          style={{ borderColor: "var(--pine-100)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--pine-50)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-space mb-1">No products configured</p>
          <p className="text-xs mb-5 max-w-xs mx-auto" style={{ color: "#9ca3af" }}>
            Add a product to unlock context-aware PRD generation with your real product knowledge.
          </p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-offwhite bg-pine hover:bg-pine-dark transition-colors"
          >
            Add your first product
            <ArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {products.map((p) => (
            <ProductSelectCard key={p.id} product={p} onSelect={() => onSelect(p.id)} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--pine-100)" }} />
        <span className="text-xs" style={{ color: "#9ca3af" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "var(--pine-100)" }} />
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={onSkip}
          className="text-sm font-medium transition-colors hover:underline"
          style={{ color: "#9ca3af" }}
        >
          Continue without selecting a product
        </button>
      </div>
    </div>
  );
}

// ─── PRODUCT BANNER ───────────────────────────────────────────────────────────

function ProductBanner({
  product,
  onChangeProduct,
}: {
  product: DBProductWithRelations;
  onChangeProduct: () => void;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border px-4 py-3 mb-5"
      style={{ background: "var(--pine-50)", borderColor: "var(--pine-100)" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
        style={{ background: "var(--pine)", color: "var(--mint)" }}
      >
        {product.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-space leading-none">{product.name}</p>
        {product.short_description && (
          <p className="text-xs mt-0.5 truncate" style={{ color: "#4a5568" }}>{product.short_description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 text-[11px]" style={{ color: "var(--pine)" }}>
          <span>{product.personas.length} persona{product.personas.length !== 1 ? "s" : ""}</span>
          <span className="text-pine-100">·</span>
          <span>{product.knowledge_base_items.length} KB item{product.knowledge_base_items.length !== 1 ? "s" : ""}</span>
        </div>
        <button
          onClick={onChangeProduct}
          className="text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors hover:bg-white"
          style={{ color: "var(--pine)", borderColor: "var(--pine-100)" }}
        >
          Change
        </button>
      </div>
    </div>
  );
}

// ─── PERSONA CHIPS ────────────────────────────────────────────────────────────

function PersonaChips({
  personas,
  selectedIds,
  onToggle,
}: {
  personas: DBPersona[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (personas.length === 0) return null;

  return (
    <div
      className="rounded-xl border px-4 py-4 mb-5"
      style={{ borderColor: "var(--pine-100)", background: "white" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--pine)" }}>
          Personas for this PRD
        </p>
        {selectedIds.length > 0 && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(166,255,163,0.2)", color: "var(--pine)" }}
          >
            {selectedIds.length} selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {personas.map((persona) => {
          const selected = selectedIds.includes(persona.id);
          return (
            <button
              key={persona.id}
              onClick={() => onToggle(persona.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={
                selected
                  ? { background: "var(--pine)", color: "var(--offwhite)", borderColor: "var(--pine)" }
                  : { background: "white", color: "var(--space)", borderColor: "var(--pine-100)" }
              }
            >
              {selected && <CheckIcon />}
              {persona.name}
              <span
                className="text-[10px] font-normal"
                style={{ opacity: 0.65 }}
              >
                · {persona.tech_savviness}
              </span>
            </button>
          );
        })}
      </div>
      {selectedIds.length === 0 && (
        <p className="mt-2.5 text-xs" style={{ color: "#9ca3af" }}>
          Select the personas this PRD is written for — they'll be included in the AI context
        </p>
      )}
    </div>
  );
}

// ─── STEP NAV ─────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Context" },
  { id: 2, label: "Uploads" },
  { id: 3, label: "PRD Settings" },
];

function StepNav({ current, onChange }: { current: number; onChange: (s: number) => void }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <button onClick={() => onChange(step.id)} className="flex items-center gap-2.5 group">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all"
                style={
                  done || active
                    ? { background: "var(--pine)", color: "var(--offwhite)" }
                    : { background: "#e5e7eb", color: "#9ca3af" }
                }
              >
                {done ? <CheckIcon /> : step.id}
              </span>
              <span
                className="text-sm font-medium transition-colors"
                style={active ? { color: "var(--space)" } : done ? { color: "var(--pine)" } : { color: "#9ca3af" }}
              >
                {step.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="mx-4 h-px w-10 flex-shrink-0"
                style={{ background: done ? "var(--mint)" : "#e5e7eb" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 1: CONTEXT ─────────────────────────────────────────────────────────

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-pine-100 text-sm text-space placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition bg-white";
const focusStyle = { "--tw-ring-color": "var(--pine)" } as React.CSSProperties;

function StepContext({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-space mb-1">Context & Problem Statement</h2>
        <p className="text-sm" style={{ color: "#4a5568" }}>
          Describe the problem you&apos;re solving. Paste customer feedback, observations, solution ideas — unstructured is fine.
        </p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        placeholder={`E.g.\n\nProblem: Users are dropping off during onboarding because the setup is too complex...\n\nCustomer feedback:\n"I spent 30 minutes trying to connect my data source and gave up"\n\nIdea: Guided setup wizard with smart defaults...`}
        className={`${inputClass} resize-none leading-relaxed font-mono`}
        style={focusStyle}
      />
      <p className="mt-2 text-xs" style={{ color: "#9ca3af" }}>
        {value.trim().length > 0
          ? `${value.trim().split(/\s+/).length} words`
          : "No minimum — paste as much or as little as you have"}
      </p>
    </div>
  );
}

// ─── STEP 2: UPLOADS ─────────────────────────────────────────────────────────

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function StepUploads({
  files, onAdd, onRemove,
}: {
  files: UploadedFile[];
  onAdd: (f: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onAdd(Array.from(e.dataTransfer.files).filter((f) => ACCEPTED_TYPES.includes(f.type)));
  }, [onAdd]);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-space mb-1">Supporting Materials</h2>
        <p className="text-sm" style={{ color: "#4a5568" }}>
          Attach transcripts, feedback exports, specs, or screenshots. These supplement your product&apos;s knowledge base for this specific PRD.
        </p>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all"
        style={
          dragging
            ? { borderColor: "var(--pine)", background: "var(--pine-50)" }
            : { borderColor: "var(--pine-100)", background: "var(--offwhite)" }
        }
      >
        <input ref={inputRef} type="file" accept={ACCEPTED_EXTENSIONS} multiple className="sr-only"
          onChange={(e) => { onAdd(Array.from(e.target.files ?? [])); e.target.value = ""; }}
        />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dragging ? "var(--pine)" : "#9ca3af"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: dragging ? "var(--pine)" : "var(--space)" }}>
            {dragging ? "Drop files here" : "Drag & drop or click to browse"}
          </p>
          <p className="mt-1 text-xs" style={{ color: "#9ca3af" }}>PDF, Word, TXT, PNG, JPG</p>
        </div>
      </div>
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((uf) => (
            <li key={uf.id} className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3" style={{ borderColor: "var(--pine-100)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                {uf.file.type.startsWith("image/")
                  ? <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>
                  : <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-space truncate">{uf.file.name}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>{formatBytes(uf.file.size)}</p>
              </div>
              <button onClick={() => onRemove(uf.id)} className="p-1 rounded-md hover:bg-red-50 hover:text-red-500 transition-colors" style={{ color: "#9ca3af" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length === 0 && (
        <p className="mt-3 text-xs text-center" style={{ color: "#9ca3af" }}>No files added — optional</p>
      )}
    </div>
  );
}

// ─── STEP 3: PRD SETTINGS ─────────────────────────────────────────────────────

function StepSettings({
  productName, featureName, targetRelease,
  onProductName, onFeatureName, onTargetRelease,
  onGenerate, canGenerate,
}: {
  productName: string; featureName: string; targetRelease: string;
  onProductName: (v: string) => void; onFeatureName: (v: string) => void;
  onTargetRelease: (v: string) => void;
  onGenerate: () => void; canGenerate: boolean;
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-space mb-1">PRD Settings</h2>
        <p className="text-sm" style={{ color: "#4a5568" }}>A few final details to frame the document correctly.</p>
      </div>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-space mb-1.5">Product name</label>
          <input type="text" value={productName} onChange={(e) => onProductName(e.target.value)}
            placeholder="e.g. Acme Analytics" className={inputClass} style={focusStyle} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-space mb-1.5">
            Feature / epic name <span className="text-red-400">*</span>
          </label>
          <input type="text" value={featureName} onChange={(e) => onFeatureName(e.target.value)}
            placeholder="e.g. Onboarding Wizard v2" className={inputClass} style={focusStyle} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-space mb-1.5">Target release</label>
          <input type="text" value={targetRelease} onChange={(e) => onTargetRelease(e.target.value)}
            placeholder="e.g. Q2 2025, Sprint 14, v3.2" className={inputClass} style={focusStyle} />
        </div>
        <div className="pt-3 flex items-center gap-4" style={{ borderTop: "1px solid var(--pine-100)" }}>
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={
              canGenerate
                ? { background: "var(--pine)", color: "var(--offwhite)" }
                : { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" }
            }
          >
            <BoltIcon />
            Generate PRD
          </button>
          {!canGenerate && <p className="text-xs" style={{ color: "#9ca3af" }}>Feature / epic name is required</p>}
        </div>
      </div>
    </div>
  );
}

// ─── GENERATING VIEW ──────────────────────────────────────────────────────────

function GeneratingView({ streamedText }: { streamedText: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--pine)", borderTopColor: "transparent" }} />
        <span className="text-sm font-medium text-space">Generating your PRD…</span>
      </div>
      <div className="rounded-xl border px-6 py-5 min-h-48 max-h-[60vh] overflow-y-auto" style={{ background: "white", borderColor: "var(--pine-100)" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3" style={{ color: "var(--pine)" }}>{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold mt-5 mb-2 pb-1.5" style={{ color: "var(--pine)", borderBottom: "1px solid var(--pine-100)" }}>{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mt-4 mb-1.5" style={{ color: "var(--space)" }}>{children}</h3>,
            p: ({ children }) => <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--space)" }}>{children}</p>,
            ul: ({ children }) => <ul className="text-sm mb-2 pl-5 space-y-0.5" style={{ color: "var(--space)", listStyleType: "disc" }}>{children}</ul>,
            ol: ({ children }) => <ol className="text-sm mb-2 pl-5 space-y-0.5" style={{ color: "var(--space)", listStyleType: "decimal" }}>{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            table: ({ children }) => <div className="overflow-x-auto mb-3"><table className="w-full text-sm border-collapse">{children}</table></div>,
            th: ({ children }) => <th className="px-3 py-1.5 text-left text-xs font-semibold text-offwhite" style={{ background: "var(--pine)" }}>{children}</th>,
            td: ({ children }) => <td className="px-3 py-1.5 text-xs border-b" style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}>{children}</td>,
            strong: ({ children }) => <strong className="font-semibold" style={{ color: "var(--space)" }}>{children}</strong>,
            code: ({ children }) => <code className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "var(--pine-50)", color: "var(--pine)" }}>{children}</code>,
          }}
        >
          {streamedText}
        </ReactMarkdown>
        {streamedText && <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse align-middle" style={{ background: "var(--pine)" }} />}
      </div>
    </div>
  );
}

// ─── SUMMARY PANEL ────────────────────────────────────────────────────────────

function SummaryPanel({
  form, step, selectedProduct, selectedPersonaIds,
}: {
  form: FormState;
  step: number;
  selectedProduct: DBProductWithRelations | undefined;
  selectedPersonaIds: string[];
}) {
  const wordCount = form.context.trim() ? form.context.trim().split(/\s+/).length : 0;
  const selectedPersonas = selectedProduct?.personas.filter((p) => selectedPersonaIds.includes(p.id)) ?? [];

  const rows = [
    { label: "Product", value: selectedProduct?.name ?? null },
    { label: "Personas", value: selectedPersonas.length > 0 ? selectedPersonas.map((p) => p.name).join(", ") : null },
    { label: "Context", value: wordCount > 0 ? `${wordCount} words` : null },
    { label: "Uploads", value: form.files.length > 0 ? `${form.files.length} file${form.files.length > 1 ? "s" : ""}` : null },
    { label: "Feature", value: form.featureName || null },
    { label: "Release", value: form.targetRelease || null },
  ];

  return (
    <div className="rounded-xl border p-5 sticky top-6" style={{ background: "var(--sky)", borderColor: "var(--sky-dark)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--pine)" }}>
        Summary
      </p>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3">
            <span className="text-xs flex-shrink-0" style={{ color: "#4a5568" }}>{row.label}</span>
            <span className="text-xs font-medium text-right truncate max-w-[120px]" style={{ color: row.value ? "var(--space)" : "#9ca3af" }}>
              {row.value ?? "—"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--sky-dark)" }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--sky-dark)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, background: "var(--pine)" }}
            />
          </div>
          <span className="text-[11px] flex-shrink-0" style={{ color: "#4a5568" }}>{step}/{STEPS.length}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function PRDForm() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DBProductWithRelations | undefined>(undefined);

  const [view, setView] = useState<View>("product-selection");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(({ data }) => setProducts(data ?? []));
  }, []);
  const [step, setStep] = useState(1);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    context: "",
    files: [],
    productName: "",
    featureName: "",
    targetRelease: "",
  });

  async function handleSelectProduct(id: string) {
    setSelectedProductId(id);
    setSelectedPersonaIds([]);
    setView("form");
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      const { data } = await res.json();
      setSelectedProduct(data);
      setForm((prev) => ({ ...prev, productName: data.name }));
    }
  }

  function handleSkipProduct() {
    setSelectedProductId(null);
    setSelectedProduct(undefined);
    setSelectedPersonaIds([]);
    setView("form");
  }

  function handleChangeProduct() {
    setSelectedProduct(undefined);
    setView("product-selection");
  }

  function togglePersona(id: string) {
    setSelectedPersonaIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  const addFiles = useCallback((newFiles: File[]) => {
    setForm((prev) => ({
      ...prev,
      files: [
        ...prev.files,
        ...newFiles.map((f) => ({ id: `${f.name}-${Date.now()}-${Math.random()}`, file: f })),
      ],
    }));
  }, []);

  const removeFile = useCallback((id: string) => {
    setForm((prev) => ({ ...prev, files: prev.files.filter((f) => f.id !== id) }));
  }, []);

  const canGenerate = form.featureName.trim().length > 0;

  async function handleGenerate() {
    setError(null);
    setStreamedText("");
    setView("generating");

    try {
      const formData = new FormData();
      formData.append("context", form.context);
      formData.append("productName", form.productName);
      formData.append("featureName", form.featureName);
      formData.append("targetRelease", form.targetRelease);

      // Attach product context for API (wired up later)
      if (selectedProduct) {
        formData.append("productContext", selectedProduct.context ?? "");
        formData.append("productDescription", selectedProduct.short_description ?? "");
      }

      // Attach selected persona details
      if (selectedProduct && selectedPersonaIds.length > 0) {
        const personas = selectedProduct.personas.filter((p) =>
          selectedPersonaIds.includes(p.id)
        );
        formData.append("personas", JSON.stringify(personas));
      }

      // Attach KB metadata (full content retrieval comes later)
      if (selectedProduct && selectedProduct.knowledge_base_items.length > 0) {
        formData.append(
          "knowledgeBaseItems",
          JSON.stringify(selectedProduct.knowledge_base_items.map((i) => ({ name: i.filename, type: i.source_type, url: i.url })))
        );
      }

      for (const uf of form.files) {
        formData.append("files", uf.file);
      }

      const response = await fetch("/api/generate-prd", { method: "POST", body: formData });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamedText(full);
      }
      setStreamedText(full);

      // Save PRD to database
      const title = [form.featureName, form.productName].filter(Boolean).join(" — ") || "Untitled PRD";
      const saveRes = await fetch("/api/prds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content_markdown: full,
          product_id: selectedProductId ?? null,
          status: "complete",
        }),
      });

      if (saveRes.ok) {
        const { data: savedPrd } = await saveRes.json();
        router.push(`/prds/${savedPrd.id}`);
      } else {
        // Fallback: show result inline if save fails
        setView("result");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setView("form");
    }
  }

  function handleReset() {
    setView("product-selection");
    setSelectedProductId(null);
    setSelectedPersonaIds([]);
    setStep(1);
    setStreamedText("");
    setForm({ context: "", files: [], productName: "", featureName: "", targetRelease: "" });
  }

  // ── Product selection view ───────────────────────────────────────────────────
  if (view === "product-selection") {
    return (
      <ProductSelectionView
        products={products}
        onSelect={handleSelectProduct}
        onSkip={handleSkipProduct}
      />
    );
  }

  // ── Result view ──────────────────────────────────────────────────────────────
  if (view === "result") {
    return (
      <div className="px-10 py-14">
        <PRDResult
          markdown={streamedText}
          productName={form.productName}
          featureName={form.featureName}
          targetRelease={form.targetRelease}
          onReset={handleReset}
        />
      </div>
    );
  }

  // ── Form / generating view ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-10 py-14">
      {/* Page header */}
      <div className="mb-8 max-w-xl">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--pine)" }}>
          PRD Generator
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-space mb-2">New PRD</h1>
        <p className="text-base leading-relaxed" style={{ color: "#4a5568" }}>
          Add context and problem details, then generate a structured PRD ready for your team.
        </p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Main card */}
        <div className="flex-1 min-w-0">
          {/* Product banner + persona chips (outside the card, above the stepper) */}
          {selectedProduct && (
            <>
              <ProductBanner product={selectedProduct} onChangeProduct={handleChangeProduct} />
              <PersonaChips
                personas={selectedProduct.personas}
                selectedIds={selectedPersonaIds}
                onToggle={togglePersona}
              />
            </>
          )}

          {/* Stepper card */}
          <div className="rounded-xl border bg-white p-8" style={{ borderColor: "var(--pine-100)" }}>
            {view === "generating" ? (
              <GeneratingView streamedText={streamedText} />
            ) : (
              <>
                <StepNav current={step} onChange={setStep} />

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {step === 1 && (
                  <StepContext value={form.context} onChange={(v) => setForm((p) => ({ ...p, context: v }))} />
                )}
                {step === 2 && (
                  <StepUploads files={form.files} onAdd={addFiles} onRemove={removeFile} />
                )}
                {step === 3 && (
                  <StepSettings
                    productName={form.productName} featureName={form.featureName} targetRelease={form.targetRelease}
                    onProductName={(v) => setForm((p) => ({ ...p, productName: v }))}
                    onFeatureName={(v) => setForm((p) => ({ ...p, featureName: v }))}
                    onTargetRelease={(v) => setForm((p) => ({ ...p, targetRelease: v }))}
                    onGenerate={handleGenerate}
                    canGenerate={canGenerate}
                  />
                )}

                <div className="mt-8 pt-6 flex justify-between" style={{ borderTop: "1px solid var(--pine-100)" }}>
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    disabled={step === 1}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-pine-50 disabled:opacity-0 disabled:pointer-events-none"
                    style={{ color: "#4a5568" }}
                  >
                    <ArrowLeft />
                    Back
                  </button>
                  {step < STEPS.length && (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-offwhite transition-colors bg-pine hover:bg-pine-dark"
                    >
                      Next
                      <ArrowRight />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="w-52 flex-shrink-0 hidden lg:block">
          <SummaryPanel
            form={form}
            step={step}
            selectedProduct={selectedProduct}
            selectedPersonaIds={selectedPersonaIds}
          />
        </div>
      </div>
    </div>
  );
}
