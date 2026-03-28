"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { DBProductWithRelations } from "@/lib/types";
import ProductForm from "@/components/products/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<DBProductWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/${id}`);
      if (res.status === 404) { setNotFound(true); setLoading(false); return; }
      if (!res.ok) { setLoading(false); return; }
      const { data } = await res.json();
      setProduct(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen px-10 py-14">
        <div className="h-8 w-48 rounded-lg animate-pulse mb-4" style={{ background: "var(--pine-50)" }} />
        <div className="h-64 w-full max-w-2xl rounded-xl animate-pulse" style={{ background: "var(--pine-50)" }} />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen px-10 py-14 flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold text-space">Product not found</h1>
        <p style={{ color: "#9ca3af" }}>This product may have been deleted or the link is invalid.</p>
        <Link href="/products" className="text-sm font-semibold" style={{ color: "var(--pine)" }}>
          ← Back to My Products
        </Link>
      </div>
    );
  }

  return <ProductForm product={product} />;
}
