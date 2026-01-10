"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { UsageMeter } from "@/components/UsageMeter";
import type { Project } from "@/lib/types";
import { useUser } from "@/lib/hooks/useUser";
import type { UsageType } from "@/lib/usage";

type UsageResponse = {
  usage: Record<UsageType, number>;
  limits: {
    projects: number;
    conversations: number;
    drafts: number;
  };
  plan?: "FREE" | "PRO";
};

export default function DashboardPage() {
  const router = useRouter();
  const { status, user, refresh } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const [projectsRes, usageRes] = await Promise.all([
          fetch("/api/projects", { cache: "no-store" }),
          fetch("/api/usage", { cache: "no-store" }),
        ]);

        if (projectsRes.ok) {
          const payload = await projectsRes.json();
          setProjects(payload ?? []);
        }

        if (usageRes.ok) {
          const used = await usageRes.json();
          setUsage({
            usage: used.usage ?? {},
            limits: used.limits,
            plan: used.plan ?? "FREE",
          });
        }
      } catch (error) {
        console.error("dashboard fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchProjects();
  }, [status, user]);

  useEffect(() => {
    if (status === "authenticated") {
      refresh();
    }
  }, [status, refresh]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="page">
        <AppNav />
        <div className="container">
          <div className="notice">Checking your session…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <AppNav />
      <div className="container">
        <header className="flex-between">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">Projects, usage, and next discovery runs.</p>
          </div>
          <Link className="btn btn-primary" href="/projects/new">
            Create project
          </Link>
        </header>

        {usage && (
          <UsageMeter
            usage={usage.usage}
            limits={usage.limits}
            planLabel={usage.plan}
            projectCount={projects.length}
          />
        )}

        <section className="grid-3" style={{ marginTop: "32px" }}>
          {projects.length === 0 && !loading ? (
            <div className="card">
              <h3>You have no projects yet</h3>
              <p className="muted">Create one to discover Reddit conversations.</p>
            </div>
          ) : (
            projects.map((project) => (
              <Link className="card" key={project.id} href={`/projects/${project.id}/conversations`}>
                <h3>{project.name}</h3>
                <p className="muted">{project.product_description}</p>
                <div className="tag">Keywords: {project.keywords.join(", ")}</div>
                <div className="tag" style={{ marginTop: "8px" }}>
                  Subreddits: {project.subreddits.join(", ")}
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
