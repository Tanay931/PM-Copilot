"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";
import { ProductsProvider } from "@/lib/products-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Redirect to onboarding if not complete
    async function checkOnboarding() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_complete")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_complete) {
        router.replace("/onboarding");
      }
    }
    checkOnboarding();
  }, [router, supabase]);

  return (
    <ProductsProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 ml-60 min-h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </ProductsProvider>
  );
}
