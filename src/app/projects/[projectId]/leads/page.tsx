"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchProjectById, ProjectView } from "@/lib/projectClient";
import { getUsage, UsageSummary } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";
import type { Lead as SprintLead } from "@/lib/sprint7Types";

const platformLabels: Record<string, string> = {
  reddit: "Reddit",
  x: "X",
};

export default function ProjectLeadsPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const { user, status } = useUser();
  const userId = user?.id ?? "";
  const projectId =
    typeof params?.projectId === "string"
      ? params.projectId
      : Array.isArray(params?.projectId)
        ? params.projectId[0]
        : "";
  const [project, setProject] = useState<ProjectView | null>(null);
  const [leads, setLeads] = useState<SprintLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingLead, setSavingLead] = useState<number | null>(null);
  const [savedLeadIds, setSavedLeadIds] = useState<Set<number>>(new Set());
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [latestRunMeta, setLatestRunMeta] = useState<{
    runId: string | null;
    createdAt: string | null;
    leadsReturned: number;
  } | null>(null);

  const refetch = useCallback(async () => {
    if (!projectId || status !== "authenticated" || !userId) {
      return [] as SprintLead[];
    }
    try {
      const loadedProject = await fetchProjectById(projectId);
      setProject(loadedProject);

      const response = await fetch(`/api/projects/${projectId}/leads`);
      if (!response.ok) {
        throw new Error("Unable to load leads.");
      }
      const payload = await response.json();
      const leadData: SprintLead[] = Array.isArray(payload?.leads) ? payload.leads : [];
      setLeads(leadData);
      setSavedLeadIds(new Set());
      setLatestRunMeta({
        runId: payload?.run_id ?? null,
        createdAt: payload?.created_at ?? null,
        leadsReturned:
          typeof payload?.leads_returned === "number" ? payload.leads_returned : leadData.length,
      });
      const usage = await getUsage(userId);
      setUsageSummary(usage);
      return leadData;
    } catch (error) {
      console.error("Failed to refresh leads", error);
      return [];
    }
  }, [projectId, status, userId]);

  useEffect(() => {
    let active = true;
    if (!projectId || status !== "authenticated" || !userId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    void (async () => {
      await refetch();
      if (active) {
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId, status, userId, refetch]);

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  const handleSave = useCallback((leadId: number) => {
    setSavingLead(leadId);
    setSavedLeadIds((prev) => {
      const next = new Set(prev);
      next.add(leadId);
      return next;
    });
    setSavingLead(null);
  }, []);

  const groupedLeads = useMemo(() => {
    const byPlatform: Record<string, SprintLead[]> = {};
    leads.forEach((lead) => {
      if (!byPlatform[lead.platform]) {
        byPlatform[lead.platform] = [];
      }
      byPlatform[lead.platform].push(lead);
    });
    return byPlatform;
  }, [leads]);

  const isBlocked =
    usageSummary !== null && (usageSummary.runsRemaining <= 0 || usageSummary.leadsRemaining <= 0);
  const showUsageWarning =
    usageSummary !== null &&
    usageSummary.leadsCap > 0 &&
    usageSummary.leadsPercent >= 80 &&
    usageSummary.leadsRemaining > 0;

  const formatRunDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString() : null;

  const latestRunDescription = latestRunMeta
    ? `Latest run${latestRunMeta.runId ? ` (${latestRunMeta.runId})` : ""} returned ${latestRunMeta.leadsReturned} lead${
        latestRunMeta.leadsReturned === 1 ? "" : "s"
      }${latestRunMeta.createdAt ? ` on ${formatRunDate(latestRunMeta.createdAt)}` : ""}.`
    : null;

  if (!projectId) {
    return null;
  }

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

  const usageMessage = usageSummary
    ? `Runs: ${usageSummary.runsUsed}/${usageSummary.runsCap} • Leads: ${usageSummary.leadsAdded}/${usageSummary.leadsCap}`
    : null;
  const blockedMessage =
    usageSummary?.plan === "free"
      ? "You've used your 3 free runs / 50 free leads. Upgrade to keep finding customers."
      : "You've hit your monthly limit. Upgrade to keep finding customers.";

  return (
    <AppShell>
      <div className="container">
        {leads.length === 0 ? (
          <section className="hero-card" style={{ marginTop: "40px" }}>
            <header className="flex-between">
              <div>
                <p className="tagline">Leads</p>
                <h1>Leads for {project?.name ?? projectId}</h1>
                <p className="muted">{project?.url ?? ""}</p>
              </div>
            </header>
            {latestRunDescription && (
              <p className="muted" style={{ marginTop: "8px" }}>
                {latestRunDescription}
              </p>
            )}
            {usageMessage && <div className="usage-summary">{usageMessage}</div>}
            {showUsageWarning && (
              <div className="notice" style={{ marginTop: "12px" }}>
                You've used 80% of your monthly leads. Upgrade to keep finding customers.
              </div>
            )}
            {isBlocked && (
              <div className="upgrade-banner" style={{ marginTop: "12px" }}>
                <p style={{ margin: 0 }}>{blockedMessage}</p>
                <Link className="btn btn-primary" href="/settings/billing">
                  Upgrade
                </Link>
              </div>
            )}
            <p className="muted" style={{ marginTop: "16px" }}>
              No leads yet. Run discovery from your project page to see fresh conversations.
            </p>
            <div className="cta-row" style={{ marginTop: "24px" }}>
              <Link className="btn btn-primary" href={`/projects/${projectId}`}>
                Back to project
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="hero-card" style={{ marginTop: "24px" }}>
              <header className="flex-between">
                <div>
                  <p className="tagline">Leads</p>
                  <h1>Leads for {project?.name ?? projectId}</h1>
                  <p className="muted">{project?.url ?? ""}</p>
                </div>
              </header>
              {latestRunDescription && (
                <p className="muted" style={{ marginTop: "12px" }}>
                  {latestRunDescription}
                </p>
              )}
              {usageMessage && <div className="usage-summary">{usageMessage}</div>}
              {showUsageWarning && (
                <div className="notice" style={{ marginTop: "12px" }}>
                  You've used 80% of your monthly leads. Upgrade to keep finding customers.
                </div>
              )}
              {isBlocked && (
                <div className="upgrade-banner" style={{ marginTop: "12px" }}>
                  <p style={{ margin: 0 }}>{blockedMessage}</p>
                  <Link className="btn btn-primary" href="/settings/billing">
                    Upgrade
                  </Link>
                </div>
              )}
              <p className="muted" style={{ marginTop: "16px" }}>
                Grouped by platform and deduplicated so you only get the best conversations.
              </p>
            </section>
            <section className="grid-2" style={{ marginTop: "24px" }}>
              {Object.keys(groupedLeads).map((platform) => {
                const platformLeads = groupedLeads[platform];
                if (!platformLeads?.length) {
                  return null;
                }
                return (
                  <article key={platform} className="card">
                    <div className="flex-between" style={{ marginBottom: "12px" }}>
                      <h3>{platformLabels[platform] ?? platform}</h3>
                      <span className="muted">{platformLeads.length} new</span>
                    </div>
                    <div className="lead-group">
                      {platformLeads.map((lead, index) => (
                        <div key={lead.lead_id} className="lead-card">
                          <div className="lead-index">
                            <span>{index + 1}</span>
                            <div>
                              <strong>
                                <a href={lead.url} target="_blank" rel="noreferrer">
                                  {lead.url}
                                </a>
                              </strong>
                              <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
                                Why it qualifies: {lead.why_match}
                              </p>
                            </div>
                          </div>
                          <div className="lead-actions">
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => handleSave(lead.lead_id)}
                              disabled={savingLead === lead.lead_id || savedLeadIds.has(lead.lead_id)}
                            >
                              {savedLeadIds.has(lead.lead_id) ? "Saved" : "Save"}
                            </button>
                            <a
                              className="btn btn-secondary"
                              href={lead.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View detail
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
