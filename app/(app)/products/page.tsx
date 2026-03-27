"use client";

import Link from "next/link";
import { useProducts } from "@/lib/products-store";
import ProductCard from "@/components/products/ProductCard";

export default function ProductsPage() {
  const { products, ready, deleteProduct } = useProducts();

  function handleDelete(id: string) {
    const product = products.find((p) => p.id === id);
    if (confirm(`Delete "${product?.name ?? "this product"}"? This cannot be undone.`)) {
      deleteProduct(id);
    }
  }

  return (
    <div className="min-h-screen px-10 py-14">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--pine)" }}>
            Products
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-space">My Products</h1>
          <p className="mt-1.5 text-base leading-relaxed max-w-md" style={{ color: "#4a5568" }}>
            Set up the products you manage. Each product stores context, knowledge base items, and
            personas that inform your AI-generated documents.
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-offwhite transition-colors bg-pine hover:bg-pine-dark flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Content */}
      {!ready ? (
        // Loading skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl border animate-pulse"
              style={{ borderColor: "var(--pine-100)", background: "var(--pine-50)" }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        // Empty state
        <div
          className="text-center py-20 rounded-2xl border-2 border-dashed"
          style={{ borderColor: "var(--pine-100)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--pine-50)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-space mb-2">No products yet</h2>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "#9ca3af" }}>
            Add your first product to start building a context library for AI-generated PRDs and documents.
          </p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-offwhite transition-colors bg-pine hover:bg-pine-dark"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
