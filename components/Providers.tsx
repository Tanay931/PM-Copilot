"use client";

// Auth state is managed via Supabase SSR cookies — no additional client context needed.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
