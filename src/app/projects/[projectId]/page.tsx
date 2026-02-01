"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchProjectById, ProjectView } from "@/lib/projectClient";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

type RunSummary = {
  run_id: string;
  created_at: string;
  leads_returned: number;
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const { status } = useUser();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const params = useParams<{ projectId: string }>();
  const projectId =
    typeof params?.projectId === "string"
      ? params.projectId
      : Array.isArray(params?.projectId)
        ? params.projectId[0]
        : "";

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  const handleFindLeads = useCallback(async () => {
    if (!projectId || !project || isRunningDiscovery) {
      return;
    }
    setIsRunningDiscovery(true);
    setDiscoveryError(null);
    try {
      const response = await fetch("/api/discovery/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to start discovery run.");
      }
      await response.json();
      void router.push(`/projects/${projectId}/leads`);
    } catch (error) {
      console.error("Discovery run failed", error);
      setDiscoveryError(
        error instanceof Error ? error.message : "Unable to start discovery run."
      );
    } finally {
      setIsRunningDiscovery(false);
    }
  }, [project, projectId, router, isRunningDiscovery]);

  useEffect(() => {
    if (!projectId || status !== "authenticated") {
      return;
    }

    let cancelled = false;
    setLoadingProject(true);
    void fetchProjectById(projectId)
      .then((data) => {
        if (!cancelled) {
          setProject(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load project", error);
        if (!cancelled) {
          setProject(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingProject(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status, projectId]);

  useEffect(() => {
    if (!projectId || status !== "authenticated") {
      setRuns([]);
      setLoadingRuns(false);
      return;
    }

    let active = true;
    setLoadingRuns(true);

    void fetch(`/api/projects/${projectId}/runs`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load run history.");
        }
        return response.json();
      })
      .then((payload) => {
        if (!active) {
          return;
        }
        setRuns(Array.isArray(payload?.runs) ? payload.runs : []);
      })
      .catch((error) => {
        console.error("Failed to load run history", error);
        if (active) {
          setRuns([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingRuns(false);
        }
      });

    return () => {
      active = false;
    };
  }, [status, projectId]);

  if (status === "loading" || loadingProject) {
    return (
      <AppShell>
        <div className="container">
          <div className="notice" style={{ marginTop: "40px" }}>
            Loading project…
          </div>
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="container">
          <div className="notice" style={{ marginTop: "40px" }}>
            Unable to find that project.
            <div className="cta-row" style={{ marginTop: "12px" }}>
              <Link className="btn btn-secondary" href="/dashboard">
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container">
        <section className="hero-card" style={{ marginTop: "40px" }}>
          <p className="tagline">Project overview</p>
          <h1>{project.name}</h1>
          {project.url ? (
            <a className="muted" href={project.url} target="_blank" rel="noreferrer" style={{ display: "block" }}>
              {project.url}
            </a>
          ) : null}
          <p style={{ marginTop: "16px" }}>{project.building}</p>
          <p className="muted">Target customer: {project.targetCustomer}</p>
          <div className="usage-row" style={{ marginTop: "20px" }}>
            <div>
              <strong>{project.usageThisMonth.leadsFound}</strong>
              <p className="muted">Leads this month</p>
            </div>
            <div>
              <strong>{project.usageThisMonth.repliesSent}</strong>
              <p className="muted">Replies sent</p>
            </div>
            <div>
              <strong>{project.usageThisMonth.creditsUsed}</strong>
              <p className="muted">Credits used</p>
            </div>
          </div>
          <div className="cta-row" style={{ marginTop: "28px" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFindLeads}
              disabled={isRunningDiscovery || loadingProject}
            >
              {isRunningDiscovery ? (
                <>
                  <span className="btn-loading" aria-hidden="true" />
                  Finding leads…
                </>
              ) : (
                "Find leads"
              )}
            </button>
            <Link className="btn btn-outline" href={`/projects/${project.id}/edit`}>
              Edit project
            </Link>
            <Link className="btn btn-secondary" href="#runs">
              View past runs
            </Link>
          </div>
          {discoveryError && (
            <div className="notice" style={{ marginTop: "12px" }}>
              {discoveryError}
            </div>
          )}
        </section>

        <section id="runs" className="hero-card" style={{ marginTop: "32px" }}>
          <h3>Discovery runs</h3>
          <p className="muted">Every run stays here so you can compare what changed.</p>
          {loadingRuns ? (
            <div className="notice" style={{ marginTop: "16px" }}>
              Loading run history…
            </div>
          ) : runs.length === 0 ? (
            <div className="notice" style={{ marginTop: "16px" }}>
              Run discovery to capture leads, then revisit this view.
            </div>
          ) : (
            <ul className="run-list" style={{ marginTop: "16px" }}>
              {runs.map((run) => (
                <li key={run.run_id} className="run-item">
                  <div>
                    <strong>{new Date(run.created_at).toLocaleDateString()}</strong>
                    <p className="muted" style={{ margin: "4px 0" }}>
                      Leads returned: {run.leads_returned}
                    </p>
                    <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                      Run ID: {run.run_id}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
