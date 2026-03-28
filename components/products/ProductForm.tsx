"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DBProductWithRelations, DBKnowledgeBaseItem, DBPersona } from "@/lib/types";

// ─── Draft types (UI-only, not persisted directly) ────────────────────────────

type TechLevel = "low" | "medium" | "high";

interface KBDraft {
  id: string;              // temp UUID for new, real UUID for existing
  source_type: "upload" | "url";
  display_name: string;    // filename or user-supplied title
  url?: string;
  file_size_bytes?: number;
  file_type?: string;
  created_at: string;
  file?: File;             // only present for new uploads
  isNew: boolean;
  isDeleted: boolean;
}

interface PersonaDraft {
  id: string;
  name: string;
  role_description: string;
  tech_savviness: TechLevel;
  behaviours: string;
  design_implications: string;
  relevant_features: string;
  isNew: boolean;
  isDeleted: boolean;
  isDirty: boolean;
}

function dbKbToKBDraft(item: DBKnowledgeBaseItem): KBDraft {
  return {
    id: item.id,
    source_type: item.source_type === "url" ? "url" : "upload",
    display_name: item.filename ?? item.url ?? "",
    url: item.url ?? undefined,
    file_size_bytes: item.file_size_bytes ?? undefined,
    created_at: item.created_at,
    isNew: false,
    isDeleted: false,
  };
}

function dbPersonaToDraft(p: DBPersona): PersonaDraft {
  return {
    id: p.id,
    name: p.name,
    role_description: p.role_description,
    tech_savviness: p.tech_savviness,
    behaviours: p.behaviours ?? "",
    design_implications: p.design_implications ?? "",
    relevant_features: p.relevant_features ?? "",
    isNew: false,
    isDeleted: false,
    isDirty: false,
  };
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-pine-100 text-sm text-space placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-transparent transition bg-white";
const focusStyle = { "--tw-ring-color": "var(--pine)" } as React.CSSProperties;

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-space mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs" style={{ color: "#9ca3af" }}>{children}</p>;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = "overview" | "knowledge-base" | "personas";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "knowledge-base",
    label: "Knowledge Base",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "personas",
    label: "Personas",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  name, shortDescription, context,
  setName, setShortDescription, setContext,
}: {
  name: string; shortDescription: string; context: string;
  setName: (v: string) => void;
  setShortDescription: (v: string) => void;
  setContext: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label required>Product name</Label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Field Manager" className={inputClass} style={focusStyle} />
      </div>
      <div>
        <Label required>Short description</Label>
        <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)}
          placeholder="One sentence describing what the product does" className={inputClass} style={focusStyle} />
        <FieldHint>Shown on the My Products card. Keep it under 120 characters.</FieldHint>
      </div>
      <div>
        <Label>Product context</Label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={10}
          placeholder={`Describe the product in detail for the AI:\n\n• What does it do?\n• Who are the primary users?\n• What key workflows does it support?\n• What problem does it solve?\n• Any important technical or business constraints?\n\nThis context is used when generating PRDs and other artefacts.`}
          className={`${inputClass} resize-none leading-relaxed`}
          style={focusStyle}
        />
        <FieldHint>
          {context.trim()
            ? `${context.trim().split(/\s+/).length} words — the richer this is, the better AI output you'll get`
            : "The more context you provide here, the more grounded and accurate your AI-generated documents will be"}
        </FieldHint>
      </div>
    </div>
  );
}

// ─── Knowledge Base Tab ───────────────────────────────────────────────────────

const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
}

function KBItemRow({ item, onDelete }: { item: KBDraft; onDelete: () => void }) {
  const isUrl = item.source_type === "url";
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-white" style={{ borderColor: "var(--pine-100)" }}>
      <span style={{ color: "var(--pine)" }} className="flex-shrink-0">
        {isUrl ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-space truncate">{item.display_name}</p>
        <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
          {isUrl
            ? `URL · Added ${formatDate(item.created_at)}`
            : `${item.file_type?.split("/")[1]?.toUpperCase() ?? "File"}${item.file_size_bytes ? ` · ${formatBytes(item.file_size_bytes)}` : ""} · Added ${formatDate(item.created_at)}`}
        </p>
      </div>
      <button onClick={onDelete} className="flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-red-50 hover:text-red-500" style={{ color: "#9ca3af" }} title="Remove">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

function KnowledgeBaseTab({
  items, onAddFile, onAddUrl, onDelete,
}: {
  items: KBDraft[];
  onAddFile: (file: File) => void;
  onAddUrl: (url: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlName, setUrlName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      files.filter((f) => ACCEPTED_DOC_TYPES.includes(f.type)).forEach((f) => onAddFile(f));
    },
    [onAddFile]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    const name = urlName.trim() || url.replace(/^https?:\/\//, "").split("/")[0];
    onAddUrl(url, name);
    setUrlInput("");
    setUrlName("");
  }

  const visible = items.filter((i) => !i.isDeleted);
  const docs = visible.filter((i) => i.source_type === "upload");
  const urls = visible.filter((i) => i.source_type === "url");

  return (
    <div className="space-y-8">
      {/* Upload zone */}
      <div>
        <Label>Documents</Label>
        <FieldHint>PDFs, Word docs, and text files — help docs, SOPs, user guides, etc.</FieldHint>
        <div
          className="mt-3 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all"
          style={dragging ? { borderColor: "var(--pine)", background: "var(--pine-50)" } : { borderColor: "var(--pine-100)", background: "var(--offwhite)" }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" multiple className="sr-only"
            onChange={(e) => { handleFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
          <span style={{ color: dragging ? "var(--pine)" : "#9ca3af" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </span>
          <p className="text-sm font-medium" style={{ color: dragging ? "var(--pine)" : "var(--space)" }}>
            {dragging ? "Drop files here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs" style={{ color: "#9ca3af" }}>PDF, Word, TXT · max 10 MB each</p>
        </div>
        {docs.length > 0 && (
          <div className="mt-3 space-y-2">
            {docs.map((item) => <KBItemRow key={item.id} item={item} onDelete={() => onDelete(item.id)} />)}
          </div>
        )}
      </div>

      {/* URL input */}
      <div>
        <Label>Website URLs</Label>
        <FieldHint>Link to product documentation, help centres, or any web-based reference material.</FieldHint>
        <div className="mt-3 rounded-xl border p-4 space-y-3" style={{ borderColor: "var(--pine-100)", background: "var(--offwhite)" }}>
          <div>
            <p className="text-xs font-medium text-space mb-1.5">URL</p>
            <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
              placeholder="https://docs.yourproduct.com/overview" className={inputClass} style={focusStyle} />
          </div>
          <div>
            <p className="text-xs font-medium text-space mb-1.5">Display name <span className="font-normal" style={{ color: "#9ca3af" }}>(optional)</span></p>
            <input type="text" value={urlName} onChange={(e) => setUrlName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
              placeholder="e.g. Product Help Centre" className={inputClass} style={focusStyle} />
          </div>
          <button onClick={handleAddUrl} disabled={!urlInput.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-offwhite transition-colors"
            style={urlInput.trim() ? { background: "var(--pine)" } : { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add URL
          </button>
        </div>
        {urls.length > 0 && (
          <div className="mt-3 space-y-2">
            {urls.map((item) => <KBItemRow key={item.id} item={item} onDelete={() => onDelete(item.id)} />)}
          </div>
        )}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: "#9ca3af" }}>
          No knowledge base items yet — add documents or URLs above
        </p>
      )}
    </div>
  );
}

// ─── Personas Tab ─────────────────────────────────────────────────────────────

const TECH_OPTIONS: TechLevel[] = ["low", "medium", "high"];
const TECH_LABELS: Record<TechLevel, string> = { low: "Low", medium: "Medium", high: "High" };
const TECH_COLORS: Record<TechLevel, { bg: string; text: string; border: string }> = {
  low:    { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  medium: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  high:   { bg: "var(--pine-50)", text: "var(--pine)", border: "var(--pine-100)" },
};

function TechBadge({ level }: { level: TechLevel }) {
  const c = TECH_COLORS[level];
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {TECH_LABELS[level]} tech
    </span>
  );
}

function TechSelector({ value, onChange }: { value: TechLevel; onChange: (v: TechLevel) => void }) {
  return (
    <div className="flex gap-2">
      {TECH_OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all"
            style={active
              ? { background: "var(--pine)", color: "var(--offwhite)", borderColor: "var(--pine)" }
              : { background: "white", color: "#6b7280", borderColor: "#e5e7eb" }}>
            {TECH_LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
}

const EMPTY_PERSONA_DRAFT: Omit<PersonaDraft, "id" | "isNew" | "isDeleted" | "isDirty"> = {
  name: "", role_description: "", tech_savviness: "medium",
  behaviours: "", design_implications: "", relevant_features: "",
};

function PersonaFormPanel({
  initial,
  onSave,
  onCancel,
  saveLabel = "Save Persona",
}: {
  initial: Omit<PersonaDraft, "id" | "isNew" | "isDeleted" | "isDirty">;
  onSave: (data: Omit<PersonaDraft, "id" | "isNew" | "isDeleted" | "isDirty">) => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const [draft, setDraft] = useState(initial);
  const set = (key: keyof typeof draft) => (v: string | TechLevel) =>
    setDraft((p) => ({ ...p, [key]: v }));

  return (
    <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: "var(--pine-100)", background: "var(--pine-50)" }}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Persona name</Label>
          <input type="text" value={draft.name} onChange={(e) => set("name")(e.target.value)}
            placeholder="e.g. UK Ecologist" className={inputClass} style={focusStyle} />
        </div>
        <div>
          <Label>Role description</Label>
          <input type="text" value={draft.role_description} onChange={(e) => set("role_description")(e.target.value)}
            placeholder="e.g. Senior field researcher, manages survey data" className={inputClass} style={focusStyle} />
        </div>
      </div>
      <div>
        <Label>Tech-savviness</Label>
        <TechSelector value={draft.tech_savviness} onChange={(v) => set("tech_savviness")(v)} />
      </div>
      <div>
        <Label>Key behaviours and needs</Label>
        <textarea value={draft.behaviours} onChange={(e) => set("behaviours")(e.target.value)} rows={3}
          placeholder="How does this persona work? What do they need from the product? What frustrates them?"
          className={`${inputClass} resize-none`} style={focusStyle} />
      </div>
      <div>
        <Label>Design implications</Label>
        <textarea value={draft.design_implications} onChange={(e) => set("design_implications")(e.target.value)} rows={3}
          placeholder="How should this persona's characteristics influence UI and UX decisions?"
          className={`${inputClass} resize-none`} style={focusStyle} />
      </div>
      <div>
        <Label>Relevant features</Label>
        <textarea value={draft.relevant_features} onChange={(e) => set("relevant_features")(e.target.value)} rows={2}
          placeholder="Which product features does this persona primarily use?"
          className={`${inputClass} resize-none`} style={focusStyle} />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button onClick={() => draft.name.trim() && onSave(draft)} disabled={!draft.name.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-offwhite transition-colors"
          style={draft.name.trim() ? { background: "var(--pine)" } : { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" }}>
          {saveLabel}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/60" style={{ color: "#6b7280" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function PersonaCard({
  persona, isEditing, onEdit, onDelete, onSave, onCancelEdit,
}: {
  persona: PersonaDraft;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (data: Omit<PersonaDraft, "id" | "isNew" | "isDeleted" | "isDirty">) => void;
  onCancelEdit: () => void;
}) {
  if (isEditing) {
    return (
      <PersonaFormPanel
        initial={{ name: persona.name, role_description: persona.role_description, tech_savviness: persona.tech_savviness,
          behaviours: persona.behaviours, design_implications: persona.design_implications, relevant_features: persona.relevant_features }}
        onSave={onSave} onCancel={onCancelEdit} saveLabel="Update Persona" />
    );
  }
  return (
    <div className="group rounded-xl border bg-white p-5 transition-all hover:shadow-sm" style={{ borderColor: "var(--pine-100)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-semibold text-space text-[15px]">{persona.name}</span>
          <TechBadge level={persona.tech_savviness} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-md transition-colors hover:bg-pine-50" style={{ color: "#6b7280" }} title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-md transition-colors hover:bg-red-50 hover:text-red-500" style={{ color: "#6b7280" }} title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>
      {persona.role_description && (
        <p className="text-sm mb-3" style={{ color: "#4a5568" }}>{persona.role_description}</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Behaviours & needs", value: persona.behaviours },
          { label: "Design implications", value: persona.design_implications },
          { label: "Relevant features", value: persona.relevant_features },
        ].filter((s) => s.value).map((s) => (
          <div key={s.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--pine)" }}>{s.label}</p>
            <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "#4a5568" }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonasTab({
  personas, onAdd, onUpdate, onDelete,
}: {
  personas: PersonaDraft[];
  onAdd: (data: Omit<PersonaDraft, "id" | "isNew" | "isDeleted" | "isDirty">) => void;
  onUpdate: (id: string, data: Omit<PersonaDraft, "id" | "isNew" | "isDeleted" | "isDirty">) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const visible = personas.filter((p) => !p.isDeleted);

  return (
    <div className="space-y-4">
      {visible.length === 0 && !showAddForm && (
        <div className="text-center py-10 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--pine-100)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--pine-50)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-space mb-1">No personas yet</p>
          <p className="text-xs mb-4" style={{ color: "#9ca3af" }}>Define the types of users who interact with this product</p>
        </div>
      )}

      {visible.map((persona) => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          isEditing={editingId === persona.id}
          onEdit={() => { setShowAddForm(false); setEditingId(persona.id); }}
          onDelete={() => onDelete(persona.id)}
          onSave={(data) => { onUpdate(persona.id, data); setEditingId(null); }}
          onCancelEdit={() => setEditingId(null)}
        />
      ))}

      {showAddForm && (
        <PersonaFormPanel
          initial={EMPTY_PERSONA_DRAFT}
          onSave={(data) => { onAdd(data); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
          saveLabel="Add Persona"
        />
      )}

      {!showAddForm && (
        <button onClick={() => { setEditingId(null); setShowAddForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-dashed transition-colors hover:bg-pine-50"
          style={{ borderColor: "var(--pine-100)", color: "var(--pine)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Persona
        </button>
      )}
    </div>
  );
}

// ─── Main ProductForm ──────────────────────────────────────────────────────────

interface ProductFormProps {
  product?: DBProductWithRelations;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Overview state
  const [name, setName] = useState(product?.name ?? "");
  const [shortDescription, setShortDescription] = useState(product?.short_description ?? "");
  const [context, setContext] = useState(product?.context ?? "");

  // KB drafts
  const [kbItems, setKbItems] = useState<KBDraft[]>(
    product?.knowledge_base_items.map(dbKbToKBDraft) ?? []
  );

  // Persona drafts
  const [personas, setPersonas] = useState<PersonaDraft[]>(
    product?.personas.map(dbPersonaToDraft) ?? []
  );

  function addKBFile(file: File) {
    setKbItems((prev) => [...prev, {
      id: crypto.randomUUID(),
      source_type: "upload",
      display_name: file.name,
      file_size_bytes: file.size,
      file_type: file.type,
      created_at: new Date().toISOString(),
      file,
      isNew: true,
      isDeleted: false,
    }]);
  }

  function addKBUrl(url: string, displayName: string) {
    setKbItems((prev) => [...prev, {
      id: crypto.randomUUID(),
      source_type: "url",
      display_name: displayName,
      url,
      created_at: new Date().toISOString(),
      isNew: true,
      isDeleted: false,
    }]);
  }

  function deleteKBItem(id: string) {
    setKbItems((prev) => prev.map((i) => i.id === id ? { ...i, isDeleted: true } : i));
  }

  function addPersona(data: Omit<PersonaDraft, "id" | "isNew" | "isDeleted" | "isDirty">) {
    setPersonas((prev) => [...prev, { ...data, id: crypto.randomUUID(), isNew: true, isDeleted: false, isDirty: false }]);
  }

  function updatePersona(id: string, data: Omit<PersonaDraft, "id" | "isNew" | "isDeleted" | "isDirty">) {
    setPersonas((prev) => prev.map((p) =>
      p.id === id ? { ...p, ...data, isDirty: !p.isNew } : p
    ));
  }

  function deletePersona(id: string) {
    setPersonas((prev) => prev.map((p) => p.id === id ? { ...p, isDeleted: true } : p));
  }

  async function handleSave() {
    if (!name.trim()) { setActiveTab("overview"); return; }
    if (!shortDescription.trim()) { setActiveTab("overview"); return; }

    setError(null);
    setSaving(true);

    try {
      let productId: string;

      // ── 1. Create or update product overview ─────────────────────────────────
      if (isEdit) {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), short_description: shortDescription.trim(), context: context.trim() }),
        });
        if (!res.ok) throw new Error("Failed to update product.");
        productId = product.id;
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), short_description: shortDescription.trim(), context: context.trim() }),
        });
        if (!res.ok) throw new Error("Failed to create product.");
        const { data } = await res.json();
        productId = data.id;
      }

      // ── 2. KB operations ─────────────────────────────────────────────────────
      const kbOps: Promise<unknown>[] = [];

      // Delete removed existing items
      kbItems.filter((i) => !i.isNew && i.isDeleted).forEach((i) => {
        kbOps.push(fetch(`/api/products/${productId}/knowledge-base/${i.id}`, { method: "DELETE" }));
      });

      // Upload new files
      kbItems.filter((i) => i.isNew && !i.isDeleted && i.source_type === "upload" && i.file).forEach((i) => {
        const form = new FormData();
        form.append("file", i.file!);
        kbOps.push(fetch(`/api/products/${productId}/knowledge-base`, { method: "POST", body: form }));
      });

      // Add new URLs
      kbItems.filter((i) => i.isNew && !i.isDeleted && i.source_type === "url").forEach((i) => {
        kbOps.push(fetch(`/api/products/${productId}/knowledge-base`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: i.url, name: i.display_name }),
        }));
      });

      // ── 3. Persona operations ────────────────────────────────────────────────
      const personaOps: Promise<unknown>[] = [];

      personas.filter((p) => !p.isNew && p.isDeleted).forEach((p) => {
        personaOps.push(fetch(`/api/products/${productId}/personas/${p.id}`, { method: "DELETE" }));
      });

      personas.filter((p) => p.isNew && !p.isDeleted).forEach((p) => {
        personaOps.push(fetch(`/api/products/${productId}/personas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name, role_description: p.role_description, tech_savviness: p.tech_savviness,
            behaviours: p.behaviours || undefined, design_implications: p.design_implications || undefined,
            relevant_features: p.relevant_features || undefined,
          }),
        }));
      });

      personas.filter((p) => !p.isNew && !p.isDeleted && p.isDirty).forEach((p) => {
        personaOps.push(fetch(`/api/products/${productId}/personas/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name, role_description: p.role_description, tech_savviness: p.tech_savviness,
            behaviours: p.behaviours || undefined, design_implications: p.design_implications || undefined,
            relevant_features: p.relevant_features || undefined,
          }),
        }));
      });

      await Promise.all([...kbOps, ...personaOps]);

      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  const pageTitle = isEdit ? product.name : "New Product";

  return (
    <div className="min-h-screen px-10 py-10">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-medium mb-3 transition-colors hover:opacity-80" style={{ color: "var(--pine)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            My Products
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-space">{pageTitle}</h1>
          {isEdit && (
            <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
              Last updated {new Date(product.updated_at).toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-xs text-red-500 max-w-xs text-right">{error}</p>}
          <button
            onClick={handleSave}
            disabled={!name.trim() || !shortDescription.trim() || saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-offwhite transition-colors"
            style={
              !name.trim() || !shortDescription.trim() || saving
                ? { background: "#9ca3af", cursor: "not-allowed" }
                : { background: "var(--pine)" }
            }
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                Save Product
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b" style={{ borderColor: "var(--pine-100)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all -mb-px border-b-2"
            style={
              activeTab === tab.id
                ? { borderColor: "var(--pine)", color: "var(--pine)" }
                : { borderColor: "transparent", color: "#6b7280" }
            }
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-2xl">
        {activeTab === "overview" && (
          <OverviewTab
            name={name} shortDescription={shortDescription} context={context}
            setName={setName} setShortDescription={setShortDescription} setContext={setContext}
          />
        )}
        {activeTab === "knowledge-base" && (
          <KnowledgeBaseTab
            items={kbItems}
            onAddFile={addKBFile}
            onAddUrl={addKBUrl}
            onDelete={deleteKBItem}
          />
        )}
        {activeTab === "personas" && (
          <PersonasTab
            personas={personas}
            onAdd={addPersona}
            onUpdate={updatePersona}
            onDelete={deletePersona}
          />
        )}
      </div>
    </div>
  );
}
