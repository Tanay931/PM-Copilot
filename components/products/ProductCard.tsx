"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

function UsersIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const personaCount = product.personas.length;
  const kbCount = product.knowledgeBase.length;
  const updatedDate = new Date(product.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="group relative bg-white rounded-xl border transition-all hover:shadow-md"
      style={{ borderColor: "var(--pine-100)", borderLeft: "3px solid var(--pine)" }}
    >
      <div className="p-5">
        {/* Name + actions */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-space text-[15px] leading-snug">{product.name}</h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Link
              href={`/products/${product.id}`}
              className="p-1.5 rounded-md transition-colors hover:bg-pine-50"
              style={{ color: "#6b7280" }}
              title="Edit product"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
            <button
              onClick={() => onDelete(product.id)}
              className="p-1.5 rounded-md transition-colors hover:bg-red-50 hover:text-red-500"
              style={{ color: "#6b7280" }}
              title="Delete product"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {product.description ? (
          <p
            className="text-sm leading-relaxed mb-4 line-clamp-2"
            style={{ color: "#4a5568" }}
          >
            {product.description}
          </p>
        ) : (
          <p className="text-sm mb-4 italic" style={{ color: "#9ca3af" }}>
            No description
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4">
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: personaCount > 0 ? "var(--pine)" : "#9ca3af" }}
          >
            <UsersIcon />
            {personaCount} persona{personaCount !== 1 ? "s" : ""}
          </span>
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: kbCount > 0 ? "var(--pine)" : "#9ca3af" }}
          >
            <BookIcon />
            {kbCount} KB item{kbCount !== 1 ? "s" : ""}
          </span>
          <span className="ml-auto text-[11px]" style={{ color: "#9ca3af" }}>
            Updated {updatedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
