"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useProducts } from "@/lib/products-store";
import ProductForm from "@/components/products/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { getProduct, ready } = useProducts();

  if (!ready) {
    return (
      <div className="min-h-screen px-10 py-14">
        <div
          className="h-8 w-48 rounded-lg animate-pulse mb-4"
          style={{ background: "var(--pine-50)" }}
        />
        <div
          className="h-64 w-full max-w-2xl rounded-xl animate-pulse"
          style={{ background: "var(--pine-50)" }}
        />
      </div>
    );
  }

  const product = getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen px-10 py-14 flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold text-space">Product not found</h1>
        <p style={{ color: "#9ca3af" }}>
          This product may have been deleted or the link is invalid.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors text-pine hover:text-pine-dark"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to My Products
        </Link>
      </div>
    );
  }

  return <ProductForm product={product} />;
}
