"use client";

import { ProductsProvider } from "@/lib/products-store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ProductsProvider>{children}</ProductsProvider>;
}
