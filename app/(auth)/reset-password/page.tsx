"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const stage = (searchParams.get("stage") as "request" | "reset") ?? "request";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?stage=reset`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pwError = validatePassword(newPassword);
    if (pwError) { setError(pwError); return; }
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  if (stage === "reset") {
    return (
      <div
        className="rounded-2xl border p-8 shadow-sm"
        style={{ background: "#fff", borderColor: "var(--pine-100)" }}
      >
        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--space)" }}>
          Set new password
        </h1>
        <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
          Choose a strong password for your account
        </p>
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--space)" }}>
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}
            />
            <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
              Min 8 characters, 1 uppercase letter, 1 number
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--space)" }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}
            />
          </div>
          {error && (
            <p className="text-sm px-3.5 py-2.5 rounded-lg" style={{ background: "#fef2f2", color: "#dc2626" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-offwhite transition-colors disabled:opacity-60"
            style={{ background: "var(--pine)" }}
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-8 shadow-sm"
      style={{ background: "#fff", borderColor: "var(--pine-100)" }}
    >
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--space)" }}>
        Reset password
      </h1>
      <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
        Enter your email and we&apos;ll send you a reset link
      </p>

      {sent ? (
        <div
          className="px-4 py-3.5 rounded-lg text-sm"
          style={{ background: "var(--pine-50)", color: "var(--pine)" }}
        >
          Check your inbox — we sent a password reset link to <strong>{email}</strong>.
        </div>
      ) : (
        <form onSubmit={handleRequest} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--space)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}
            />
          </div>
          {error && (
            <p className="text-sm px-3.5 py-2.5 rounded-lg" style={{ background: "#fef2f2", color: "#dc2626" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-offwhite disabled:opacity-60"
            style={{ background: "var(--pine)" }}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="text-center text-sm mt-6" style={{ color: "#6b7280" }}>
        <Link href="/login" className="font-semibold" style={{ color: "var(--pine)" }}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
