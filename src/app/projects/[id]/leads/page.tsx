"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  AppLead,
  AppProject,
  fetchProject,
  fetchLeads,
  fetchRuns,
  refineDiscovery,
  RunRecord,
  updateLeadStatus,
} from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

type PageProps = {
  params: {
    id: string;
  };
};

const feedbackOptions = [
  "Tone felt off",
  "Not recognizably my audience",
  "Needs more context",
];

export default function ProjectLeadsPage({ params }: PageProps) {
  const router = useRouter();
  const { status } = useUser();
  const [project, setProject] = useState<AppProject | null>(null);
  const [leads, setLeads] = useState<AppLead[]>([]);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refineStatus, setRefineStatus] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [building, setBuilding] = useState("");
  const [feedback, setFeedback] = useState<string[]>([]);
  const [savingLead, setSavingLead] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    setLoading(true);
    void fetchProject(params.id).then((value) => {
      setProject(value ?? null);
      setTargetCustomer(value?.targetCustomer ?? "");
      setBuilding(value?.building ?? "");
    });
    void fetchLeads(params.id)
      .then((data) => setLeads(data))
      .finally(() => setLoading(false));
    void fetchRuns(params.id).then((data) => setRuns(data));
  }, [status, params.id]);

  const groupedLeads = useMemo(() => {
    const byPlatform: Record<string, AppLead[]> = {};
    leads.forEach((lead) => {
      if (!byPlatform[lead.platform]) {
        byPlatform[lead.platform] = [];
      }
      byPlatform[lead.platform].push(lead);
    });
    return byPlatform;
  }, [leads]);

  const handleSave = async (leadId: string) => {
    setSavingLead(leadId);
    await updateLeadStatus(leadId, "saved");
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: "saved" } : lead))
    );
    setSavingLead(null);
  };

  const handleRefine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!targetCustomer) {
      setRefineStatus("Target customer is required.");
      return;
    }
    setRefineStatus("Refining results…");
    const run = await refineDiscovery({
      projectId: params.id,
      targetCustomer,
      building: building || undefined,
      feedback,
    });
    setRuns((prev) => [run, ...prev]);
    setRefineStatus("New run queued with your updates.");
  };

  if (status === "loading" || loading) {
    return (
      <AppShell>
        <div className="container">
          <div className="notice" style={{ marginTop: "40px" }}>
            Loading leads…
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container">
        <section className="hero-card" style={{ marginTop: "40px" }}>
          <header className="flex-between">
            <div>
              <p className="tagline">Leads</p>
              <h1>Warm leads for {project?.name || "your project"}</h1>
            </div>
            <Link className="btn btn-secondary" href={`/projects/${params.id}`}>
              Back to project
            </Link>
          </header>
          <p className="muted" style={{ marginTop: "16px" }}>
            Grouped by platform, deduplicated by canonical URL, and ready for your responses.
          </p>
        </section>

        <div className="grid-2" style={{ marginTop: "32px" }}>
          <section className="card">
            {["reddit", "x"].map((platform) => {
              const platformLeads = groupedLeads[platform] ?? [];
              if (!platformLeads.length) {
                return null;
              }
              return (
                <div key={platform} style={{ marginBottom: "24px" }}>
                  <div className="flex-between" style={{ alignItems: "baseline", marginBottom: "12px" }}>
                    <h3>{platform === "reddit" ? "Reddit leads" : "X leads"}</h3>
                    <span className="muted">{platformLeads.length} new</span>
                  </div>
                  {platformLeads.map((lead, index) => (
                    <article key={lead.id} className="lead-card">
                      <div className="lead-index">
                        <span>{index + 1}</span>
                        <p>{lead.title}</p>
                      </div>
                      <p className="muted" style={{ marginBottom: "6px" }}>
                        {lead.context}
                      </p>
                      <p className="muted" style={{ fontSize: "0.9rem" }}>
                        Why it qualifies: {lead.why_qualifies}
                      </p>
                      <div className="lead-actions">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => void handleSave(lead.id)}
                          disabled={savingLead === lead.id || lead.status !== "new"}
                        >
                          {lead.status === "saved" ? "Saved" : "Save lead"}
                        </button>
                        <Link className="btn btn-outline" href={`/leads/${lead.id}`}>
                          View replies
                        </Link>
                      </div>
                      <p className="muted" style={{ fontSize: "0.75rem", marginTop: "6px" }}>
                        Platform: {platform.toUpperCase()} · Status: {lead.status}
                      </p>
                    </article>
                  ))}
                </div>
              );
            })}
          </section>

          <aside className="refine-panel">
            <h3>Refine results</h3>
            <p className="muted">Update your target + building copy or explain what was off.</p>
            <form onSubmit={handleRefine}>
              <div className="field">
                <label>Target customer</label>
                <input
                  value={targetCustomer}
                  onChange={(event) => setTargetCustomer(event.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>What you’re building (optional)</label>
                <textarea
                  value={building}
                  onChange={(event) => setBuilding(event.target.value)}
                  rows={2}
                />
              </div>
              <div className="field">
                <label>What was off?</label>
                <div className="grid-2">
                  {feedbackOptions.map((option) => (
                    <label key={option} className="checkbox">
                      <input
                        type="checkbox"
                        checked={feedback.includes(option)}
                        onChange={() =>
                          setFeedback((prev) =>
                            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
                          )
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              {refineStatus && <div className="notice">{refineStatus}</div>}
              <div className="cta-row">
                <button className="btn btn-primary" type="submit">
                  Refine results
                </button>
              </div>
            </form>

            <div className="run-history" style={{ marginTop: "24px" }}>
              <h4>Run history</h4>
              {runs.length === 0 ? (
                <p className="muted">No runs yet.</p>
              ) : (
                runs.slice(0, 3).map((run) => (
                  <div key={run.id} className="run-item">
                    <div>
                      <strong>{new Date(run.createdAt).toLocaleString()}</strong>
                      <p className="muted">
                        {run.targetCustomer}
                        {run.feedback?.length ? ` · Feedback: ${run.feedback.join(", ")}` : ""}
                      </p>
                    </div>
                    <span className="status-pill">{run.state}</span>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
