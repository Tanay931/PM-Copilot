"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const supabase = createClient();

  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResent(false);
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
  }

  return (
    <div
      className="rounded-2xl border p-8 shadow-sm text-center"
      style={{ background: "#fff", borderColor: "var(--pine-100)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: "var(--pine-50)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--space)" }}>
        Check your email
      </h1>
      <p className="text-sm leading-relaxed mb-1" style={{ color: "#6b7280" }}>
        We sent a verification link to
      </p>
      <p className="text-sm font-semibold mb-6" style={{ color: "var(--space)" }}>
        {email}
      </p>
      <p className="text-sm leading-relaxed mb-8" style={{ color: "#6b7280" }}>
        Click the link in the email to verify your account and get started.
        The link expires in 24 hours.
      </p>

      {resent && (
        <p className="text-sm px-3.5 py-2.5 rounded-lg mb-4" style={{ background: "var(--pine-50)", color: "var(--pine)" }}>
          Email resent — check your inbox.
        </p>
      )}

      <p className="text-sm" style={{ color: "#6b7280" }}>
        Didn&apos;t receive it?{" "}
        <button
          onClick={handleResend}
          className="font-semibold transition-colors"
          style={{ color: "var(--pine)" }}
        >
          Resend email
        </button>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
