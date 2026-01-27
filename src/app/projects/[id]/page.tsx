"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchProject, fetchRuns, RunRecord, AppProject } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

type PageProps = {
  params: {
    id: string;
  };
};

export default function ProjectDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { status } = useUser();
  const [project, setProject] = useState<AppProject | null>(null);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    setLoadingProject(true);
    void fetchProject(params.id)
      .then((data) => setProject(data ?? null))
      .finally(() => setLoadingProject(false));
  }, [status, params.id]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    setLoadingRuns(true);
    void fetchRuns(params.id)
      .then((data) => setRuns(data))
      .finally(() => setLoadingRuns(false));
  }, [status, params.id]);

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
            <Link className="btn btn-primary" href={`/projects/${project.id}/discover`}>
              Find Leads
            </Link>
            <button className="btn btn-outline" disabled>
              Edit project
            </button>
            <Link className="btn btn-secondary" href="#runs">
              View past runs
            </Link>
          </div>
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
                <li key={run.id} className="run-item">
                  <div>
                    <strong>{new Date(run.createdAt).toLocaleDateString()}</strong>
                    <p className="muted">
                      Target: {run.targetCustomer || project.targetCustomer}
                      {run.building ? ` · Building: ${run.building}` : ""}
                    </p>
                  </div>
                  {run.feedback && run.feedback.length > 0 && (
                    <div className="status-pill">
                      Feedback: {run.feedback.join(", ")}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
