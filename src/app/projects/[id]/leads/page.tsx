"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import DiscoverRunner from "./DiscoverRunner";
import {
  AppLead,
  AppProject,
  fetchProject,
  fetchLeads,
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

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!projectId || status !== "authenticated") {
      return;
    }
    setLoading(true);
    const load = async () => {
      const loadedProject = await fetchProject(projectId);
      setProject(loadedProject ?? null);
      const leadData = await fetchLeads(projectId);
      setLeads(leadData);
      setLoading(false);
    };
    void load();
  }, [status, projectId]);

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
      <DiscoverRunner projectId={params.id ?? ""} />
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
            <p className="muted" style={{ marginTop: "16px" }}>
              No leads yet. Run discovery to see fresh conversations.
            </p>
            <div className="cta-row" style={{ marginTop: "24px" }}>
              <Link className="btn btn-primary" href={`/projects/${params.id ?? ""}/leads?discover=1`}>
                Find leads
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
                <button className="btn btn-primary" onClick={handleRefine} disabled={refining}>
                  {refining ? "Refining…" : "Refine results"}
                </button>
              </header>
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
                              disabled={savingLead === lead.id || lead.status !== "new"}
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
