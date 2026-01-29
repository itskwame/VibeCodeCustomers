"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import DiscoverRunner, { DiscoveryResult } from "./DiscoverRunner";
import { toast } from "@/components/toastStore";
import {
  AppLead,
  AppProject,
  fetchLeads,
  fetchProject,
  getUsage,
  refineDiscovery,
  updateLeadStatus,
  UsageSummary,
} from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

const platformLabels: Record<string, string> = {
  reddit: "Reddit",
  x: "X",
};

export default function ProjectLeadsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, status } = useUser();
  const userId = user?.id ?? "";
  const projectId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";
  const [project, setProject] = useState<AppProject | null>(null);
  const [leads, setLeads] = useState<AppLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refineNotice, setRefineNotice] = useState("");
  const [refining, setRefining] = useState(false);
  const [savingLead, setSavingLead] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);

  const refetch = useCallback(async () => {
    if (!projectId || status !== "authenticated" || !userId) {
      return [] as AppLead[];
    }
    try {
      const loadedProject = await fetchProject(projectId);
      setProject(loadedProject ?? null);
      const leadData = await fetchLeads(projectId);
      setLeads(leadData);
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

  const handleDiscoveryStart = useCallback(() => {
    setIsDiscovering(true);
  }, []);

  const handleDiscoverySuccess = useCallback(
    async (result: DiscoveryResult) => {
      await refetch();
      setIsDiscovering(false);
      if (result.status === "blocked") {
        toast.error(result.message ?? "You've hit your limit. Upgrade to keep finding customers.");
        return;
      }
      if (result.status === "error") {
        toast.error(result.message ?? "Discovery failed. Please try again.");
        return;
      }
      if (result.leadsAdded > 0) {
        const label = result.limitReached
          ? `✅ ${result.leadsAdded} new leads added (limit reached)`
          : `✅ ${result.leadsAdded} new leads added`;
        toast.success(label);
      } else {
        toast.info("No new leads found this run.");
      }
    },
    [refetch]
  );

  const handleDiscoveryError = useCallback((error: unknown) => {
    console.error(error);
    toast.error("Discovery failed. Please try again.");
    setIsDiscovering(false);
  }, []);

  const isBlocked =
    Boolean(usageSummary) && (usageSummary.runsRemaining <= 0 || usageSummary.leadsRemaining <= 0);
  const showUsageWarning =
    Boolean(usageSummary) && usageSummary.leadsCap > 0 && usageSummary.leadsPercent >= 80 && usageSummary.leadsRemaining > 0;

  const handleRunDiscovery = useCallback(() => {
    if (!projectId || !userId || isBlocked || isDiscovering) {
      return;
    }
    setIsDiscovering(true);
    void router.push(`/projects/${projectId}/leads?discover=1`);
  }, [projectId, isBlocked, isDiscovering, router, userId]);

  const handleSave = async (leadId: string) => {
    setSavingLead(leadId);
    await updateLeadStatus(leadId, "saved");
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: "saved" } : lead))
    );
    setSavingLead(null);
  };

  const handleRefine = async () => {
    if (!projectId) {
      return;
    }
    setRefining(true);
    setRefineNotice("Refining results...");
    try {
      const targetCustomer = project?.targetCustomer ?? "";
      const building = project?.building;
      await refineDiscovery({
        projectId,
        targetCustomer,
        building,
        feedback: [],
      });
      setRefineNotice("New leads added to the list.");
      const updatedLeads = await fetchLeads(projectId);
      setLeads(updatedLeads);
    } finally {
      setRefining(false);
    }
  };

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
      <DiscoverRunner
        projectId={projectId}
        userId={userId}
        onStart={handleDiscoveryStart}
        onSuccess={handleDiscoverySuccess}
        onError={handleDiscoveryError}
      />
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
            {isDiscovering && (
              <div className="discovery-indicator" role="status" aria-live="polite" style={{ marginTop: "12px" }}>
                <span className="discovery-indicator__dot" />
                Finding leads…
              </div>
            )}
            <p className="muted" style={{ marginTop: "16px" }}>
              No leads yet. Run discovery to see fresh conversations.
            </p>
            <div className="cta-row" style={{ marginTop: "24px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRunDiscovery}
                disabled={isBlocked || isDiscovering}
              >
                {isDiscovering ? (
                  <>
                    <span className="btn-loading" aria-hidden="true" />
                    Finding leads…
                  </>
                ) : (
                  "Find leads"
                )}
              </button>
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
                <button className="btn btn-primary" onClick={handleRefine} disabled={refining || isDiscovering}>
                  {refining ? "Refining…" : "Refine results"}
                </button>
              </header>
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
              {isDiscovering && (
                <div className="discovery-indicator" role="status" aria-live="polite" style={{ marginTop: "12px" }}>
                  <span className="discovery-indicator__dot" />
                  Finding leads…
                </div>
              )}
              <p className="muted" style={{ marginTop: "16px" }}>
                Grouped by platform and deduplicated so you only get the best conversations.
              </p>
              {refineNotice && <p className="muted">{refineNotice}</p>}
            </section>
            <section className="grid-2" style={{ marginTop: "24px" }}>
              {Object.keys(platformLabels).map((platform) => {
                const platformLeads = groupedLeads[platform] ?? [];
                if (!platformLeads.length) {
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
                        <div key={lead.id} className="lead-card">
                          <div className="lead-index">
                            <span>{index + 1}</span>
                            <div>
                              <strong>{lead.title}</strong>
                              <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
                                Why it qualifies: {lead.why_qualifies}
                              </p>
                            </div>
                          </div>
                          <div className="lead-actions">
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => void handleSave(lead.id)}
                              disabled={savingLead === lead.id || lead.status !== "new" || isDiscovering}
                            >
                              {lead.status === "saved" ? "Saved" : "Save"}
                            </button>
                            <Link className="btn btn-secondary" href={`/leads/${lead.id}`}>
                              View detail
                            </Link>
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
