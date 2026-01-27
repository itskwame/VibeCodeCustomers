"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchProjects, AppProject } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useUser();
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const showEmptyState = !loading && projects.length === 0;

  return (
    <AppShell>
      <div className="container">
        {(status === "loading" && !projects.length) || (loading && !projects.length) ? (
          <div className="notice" style={{ marginTop: "40px" }}>
            Loading your dashboard…
          </div>
        ) : showEmptyState ? (
          <section className="hero-card welcome-hero" style={{ marginTop: "40px" }}>
            <p className="tagline">Dashboard</p>
            <h1>No projects yet</h1>
            <p className="muted">
              Describe what you are building, who it helps, and we will keep an eye on fresh conversations for
              you.
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/projects/new">
                Create your first project
              </Link>
            </div>
          </section>
        ) : (
          <>
            <header className="flex-between" style={{ margin: "40px 0 16px" }}>
              <div>
                <h1>Dashboard</h1>
                <p className="muted">Projects, discovery runs, and saved leads in one place.</p>
              </div>
              <Link className="btn btn-primary" href="/projects/new">
                New project
              </Link>
            </header>
            <section id="projects" className="project-grid" style={{ marginTop: "16px" }}>
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <div>
                    <h3>{project.name}</h3>
                    <p className="muted">{project.building}</p>
                    <p className="muted" style={{ marginTop: "8px" }}>
                      Target: {project.targetCustomer}
                    </p>
                  </div>
                  <div className="usage-row">
                    <div>
                      <strong>{project.usageThisMonth.leadsFound}</strong>
                      <p className="muted">Leads found</p>
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
                  <div className="cta-row" style={{ marginTop: "12px" }}>
                    <Link className="btn btn-primary" href={`/projects/${project.id}`}>
                      View project
                    </Link>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
