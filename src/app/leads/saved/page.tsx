"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchProjects, fetchSavedLeads, AppLead, AppProject } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

export default function SavedLeadsPage() {
  const router = useRouter();
  const { status } = useUser();
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [leads, setLeads] = useState<AppLead[]>([]);
  const [projectFilter, setProjectFilter] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    void fetchProjects().then(setProjects);
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    void fetchSavedLeads(projectFilter || undefined).then(setLeads);
  }, [status, projectFilter]);

  const groupedByProject = useMemo(() => {
    const grouping: Record<string, AppLead[]> = {};
    leads.forEach((lead) => {
      if (!grouping[lead.projectId]) {
        grouping[lead.projectId] = [];
      }
      grouping[lead.projectId].push(lead);
    });
    return grouping;
  }, [leads]);

  const statusLabel = (statusValue: AppLead["status"]) => {
    if (statusValue === "responded") {
      return "Responded";
    }
    return statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
  };

  if (status === "loading") {
    return (
      <AppShell>
        <div className="container">
          <div className="notice" style={{ marginTop: "40px" }}>
            Loading saved leads…
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
              <h1>Saved leads</h1>
              <p className="muted">Track status across projects.</p>
            </div>
            <Link className="btn btn-primary" href="/dashboard">
              Back to dashboard
            </Link>
          </header>
          <div className="field" style={{ marginTop: "16px" }}>
            <label>Filter by project</label>
            <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="grid-2" style={{ marginTop: "32px" }}>
          {Object.entries(groupedByProject).map(([projectId, projectLeads]) => (
            <div key={projectId} className="card saved-group">
              <h3>
                {projects.find((project) => project.id === projectId)?.name || "Project"}
              </h3>
              <div className="saved-list">
                {projectLeads.map((lead) => (
                  <article key={lead.id} className="lead-card saved-lead-card">
                    <div className="lead-index">
                      <span>#{lead.id.split("-").pop()}</span>
                      <p>{lead.title}</p>
                    </div>
                    <p className="muted" style={{ fontSize: "0.85rem" }}>
                      Status: <span className="status-pill">{statusLabel(lead.status)}</span>
                    </p>
                    <p className="muted" style={{ fontSize: "0.85rem" }}>
                      Platform: {lead.platform.toUpperCase()} · Why: {lead.why_qualifies}
                    </p>
                    <Link className="btn btn-outline" href={`/leads/${lead.id}`}>
                      View detail
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          ))}
          {!leads.length && (
            <div className="notice" style={{ marginTop: "16px" }}>
              No saved leads yet. Save a lead from a discovery run to see it here.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
