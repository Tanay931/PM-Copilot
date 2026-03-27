"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const supabase = createClient();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "signup",
    });

    if (error) {
      setError("Invalid or expired code. Please try again.");
      setLoading(false);
      return;
    }

    // Create user profile row (handled in callback for OAuth; do it here for email flow)
    await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    router.push("/onboarding");
  }

  async function handleResend() {
    setResent(false);
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
  }

  return (
    <div
      className="rounded-2xl border p-8 shadow-sm"
      style={{ background: "#fff", borderColor: "var(--pine-100)" }}
    >
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--space)" }}>
        Check your email
      </h1>
      <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
        We sent a 6-digit code to <strong style={{ color: "var(--space)" }}>{email}</strong>
      </p>

      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--space)" }}>
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
            placeholder="000000"
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none tracking-widest text-center font-mono"
            style={{ borderColor: "var(--pine-100)", color: "var(--space)", fontSize: "1.25rem" }}
          />
        </div>

        {error && (
          <p className="text-sm px-3.5 py-2.5 rounded-lg" style={{ background: "#fef2f2", color: "#dc2626" }}>
            {error}
          </p>
        )}
        {resent && (
          <p className="text-sm px-3.5 py-2.5 rounded-lg" style={{ background: "var(--pine-50)", color: "var(--pine)" }}>
            Code resent — check your inbox.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-offwhite transition-colors disabled:opacity-60"
          style={{ background: "var(--pine)" }}
        >
          {loading ? "Verifying…" : "Verify email"}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "#6b7280" }}>
        Didn&apos;t receive it?{" "}
        <button
          onClick={handleResend}
          className="font-semibold transition-colors"
          style={{ color: "var(--pine)" }}
        >
          Resend code
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
