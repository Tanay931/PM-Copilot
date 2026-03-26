"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product, KnowledgeBaseItem, Persona } from "./types";

// ─── Store interface ──────────────────────────────────────────────────────────

interface ProductsStore {
  products: Product[];
  ready: boolean;
  addProduct: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => Product;
  updateProduct: (id: string, updates: Partial<Omit<Product, "id" | "createdAt">>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsStore | null>(null);
const STORAGE_KEY = "bngai_products_v1";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProducts(JSON.parse(raw) as Product[]);
    } catch {
      // ignore parse errors
    }
    setReady(true);
  }, []);

  // Persist whenever products change (after initial load)
  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, ready]);

  const addProduct = useCallback(
    (data: Omit<Product, "id" | "createdAt" | "updatedAt">): Product => {
      const now = new Date().toISOString();
      const product: Product = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
      setProducts((prev) => [...prev, product]);
      return product;
    },
    []
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Omit<Product, "id" | "createdAt">>) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
      );
    },
    []
  );

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProduct = useCallback(
    (id: string): Product | undefined => products.find((p) => p.id === id),
    [products]
  );

  return (
    <ProductsContext.Provider value={{ products, ready, addProduct, updateProduct, deleteProduct, getProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProducts(): ProductsStore {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within <ProductsProvider>");
  return ctx;
}

// Re-export types that consumers need
export type { Product, KnowledgeBaseItem, Persona };
