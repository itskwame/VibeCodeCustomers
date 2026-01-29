"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import DiscoverRunner, { DiscoveryResult } from "./DiscoverRunner";
import { toast } from "@/components/toastStore";
import {
  AppLead,
  AppProject,
  fetchLeads,
  fetchProject,
  refineDiscovery,
  updateLeadStatus,
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
  const projectId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";
  const { status } = useUser();
  const [project, setProject] = useState<AppProject | null>(null);
  const [leads, setLeads] = useState<AppLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refineNotice, setRefineNotice] = useState("");
  const [refining, setRefining] = useState(false);
  const [savingLead, setSavingLead] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const leadsRef = useRef<AppLead[]>([]);

  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  const refetch = useCallback(async () => {
    if (!projectId || status !== "authenticated") {
      return [];
    }
    const loadedProject = await fetchProject(projectId);
    setProject(loadedProject ?? null);
    const leadData = await fetchLeads(projectId);
    setLeads(leadData);
    return leadData;
  }, [projectId, status]);

  useEffect(() => {
    let active = true;
    if (!projectId || status !== "authenticated") {
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
  }, [projectId, status, refetch]);

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
      try {
        const beforeCount = leadsRef.current.length;
        const updatedLeads = await refetch();
        const added = Math.max(0, (updatedLeads.length ?? 0) - beforeCount);
        if (result.limitReached) {
          toast.error(result.message ?? "Discovery limit reached. Please try again.");
        } else if (added > 0) {
          toast.success(`✅ ${added} new leads added`);
        } else {
          toast.info("No new leads found this run.");
        }
      } finally {
        setIsDiscovering(false);
      }
    },
    [refetch]
  );

  const handleDiscoveryError = useCallback((error: unknown) => {
    console.error(error);
    toast.error("Discovery failed. Please try again.");
    setIsDiscovering(false);
  }, []);

  const handleRunDiscovery = useCallback(() => {
    if (!projectId || isDiscovering) {
      return;
    }
    setIsDiscovering(true);
    void router.push(`/projects/${projectId}/leads?discover=1`);
  }, [projectId, isDiscovering, router]);

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
      const updated = await fetchLeads(projectId);
      setLeads(updated);
    } finally {
      setRefining(false);
    }
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
      <DiscoverRunner
        projectId={projectId}
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
                disabled={isDiscovering}
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
              {["reddit", "x"].map((platform) => {
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
