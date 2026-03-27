"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const JOB_TITLES = [
  "Product Manager",
  "Senior Product Manager",
  "Principal Product Manager",
  "Group Product Manager",
  "Director of Product",
  "VP of Product",
  "Chief Product Officer",
  "Product Owner",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function prefill() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.name) setName(user.user_metadata.name);
      if (user?.user_metadata?.full_name) setName(user.user_metadata.full_name);
    }
    prefill();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !jobTitle || !company.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        job_title: jobTitle,
        company: company.trim(),
        description: description.trim() || undefined,
        onboarding_complete: true,
      }),
    });

    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--pine-50)" }}
    >
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-offwhite text-sm font-bold"
            style={{ background: "var(--pine)" }}
          >
            PM
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--space)" }}>
            PM Copilot
          </span>
        </div>

        <div
          className="rounded-2xl border p-8 shadow-sm"
          style={{ background: "#fff", borderColor: "var(--pine-100)" }}
        >
          <div className="mb-6">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--pine)" }}
            >
              Step 1 of 1
            </span>
            <h1
              className="text-2xl font-bold tracking-tight mt-1"
              style={{ color: "var(--space)" }}
            >
              Tell us about yourself
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              This helps PM Copilot personalise your PRD generation experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--space)" }}>
                Full name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Alex Johnson"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--space)" }}>
                Job title <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none appearance-none"
                style={{ borderColor: "var(--pine-100)", color: jobTitle ? "var(--space)" : "#9ca3af" }}
              >
                <option value="">Select your role</option>
                {JOB_TITLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--space)" }}>
                Company <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="Acme Corp"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--space)" }}>
                What do you build?{" "}
                <span className="font-normal" style={{ color: "#9ca3af" }}>
                  (optional)
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. B2B SaaS platform for enterprise analytics teams"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={{ borderColor: "var(--pine-100)", color: "var(--space)" }}
              />
            </div>

            {error && (
              <p
                className="text-sm px-3.5 py-2.5 rounded-lg"
                style={{ background: "#fef2f2", color: "#dc2626" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-offwhite transition-colors disabled:opacity-60"
              style={{ background: "var(--pine)" }}
            >
              {loading ? "Saving…" : "Get started"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
