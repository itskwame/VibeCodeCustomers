"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Lead, DiscoveryRunResult } from "@/lib/sprint7Types";

type ResultState = DiscoveryRunResult | null;

export default function DiscoverPage() {
  const [projectDescription, setProjectDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [result, setResult] = useState<ResultState>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupedLeads = useMemo(() => {
    if (!result) return {};
    return result.leads.reduce<Record<string, Lead[]>>((acc, lead) => {
      acc[lead.platform] = acc[lead.platform] ?? [];
      acc[lead.platform].push(lead);
      return acc;
    }, {});
  }, [result]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectDescription.trim()) {
      setError("Describe your project before running discovery.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/discovery/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_description: projectDescription.trim(),
          website_url: websiteUrl.trim() || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Discovery run failed");
      }
      setResult(payload);
    } catch (runError) {
      setResult(null);
      setError(
        runError instanceof Error ? runError.message : "Unable to run discovery"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Clipboard not available");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">Discovery Run</h1>
        <p className="text-sm text-slate-600">
          Describe your customer problem and website (if you have one) so we can
          run a discovery session that returns high-signal leads and replies.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project description</label>
            <textarea
              required
              minLength={20}
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
              placeholder="Describe who you help, what you offer, and the results people care about."
              className="w-full rounded-lg border border-slate-200 p-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Optional website URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://"
              className="w-full rounded-lg border border-slate-200 p-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Finding leads…" : "Run Discovery"}
          </button>
        </form>
        {loading && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            Finding leads… this can take up to a minute.
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </section>

      {result && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Phase 1 profile</h2>
            <p className="text-sm text-slate-600">
              {result.phase1.product_name} — {result.phase1.product_summary_plain}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Language cue: {result.phase1.language_customers_use.join(", ")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-semibold">
              Leads ({result.leads.length})
            </h3>
            {["reddit", "x"].map((platform) => {
              const platformLeads = groupedLeads[platform] ?? [];
              return (
                <div key={platform}>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {platform}
                  </h4>
                  <div className="space-y-3 mt-2">
                    {platformLeads.length === 0 && (
                      <p className="text-xs text-slate-400">No leads yet.</p>
                    )}
                    {platformLeads.map((lead) => (
                      <article
                        key={`${lead.platform}-${lead.lead_id}`}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                      >
                        <div className="text-xs text-slate-500">
                          {lead.platform} • {lead.url}
                        </div>
                        <p className="text-sm font-semibold mt-2">
                          {lead.why_match}
                        </p>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Reply 1</span>
                            <button
                              type="button"
                              onClick={() => copyText(lead.reply_suggestion_1)}
                              className="text-xs text-slate-500 underline"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-slate-700">
                            {lead.reply_suggestion_1}
                          </p>
                          <div className="flex items-center justify-between">
                            <span>Reply 2</span>
                            <button
                              type="button"
                              onClick={() => copyText(lead.reply_suggestion_2)}
                              className="text-xs text-slate-500 underline"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-slate-700">
                            {lead.reply_suggestion_2}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
