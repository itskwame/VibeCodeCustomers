"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchProject, runDiscovery } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

type PageProps = {
  params: {
    id: string;
  };
};

export default function ProjectDiscoverPage({ params }: PageProps) {
  const router = useRouter();
  const { status } = useUser();
  const [projectName, setProjectName] = useState("");
  const [loadingProject, setLoadingProject] = useState(true);
  const [running, setRunning] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [notice, setNotice] = useState("");

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
      .then((project) => {
        setProjectName(project?.name ?? "");
      })
      .finally(() => setLoadingProject(false));
  }, [status, params.id]);

  const handleStart = async () => {
    setRunning(true);
    setLimitReached(false);
    setNotice("Matching conversations to your description...");
    const result = await runDiscovery(params.id);
    if (result.limitReached) {
      setLimitReached(true);
      setNotice(result.message ?? "You have reached the run limit.");
      setRunning(false);
      return;
    }
    router.push(`/projects/${params.id}/leads?run=latest`);
  };

  if (status === "loading" || loadingProject) {
    return (
      <AppShell>
        <div className="container">
          <div className="notice" style={{ marginTop: "40px" }}>
            Preparing discovery…
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container">
        <section className="hero-card" style={{ marginTop: "40px" }}>
          <h1>Lead search for {projectName || "your project"}</h1>
          <p className="muted">
            Start a mock discovery run, preview the loading experience, and then hop into the lead stream.
          </p>
          <div className="cta-row" style={{ marginTop: "24px" }}>
            <button
              className="btn btn-primary"
              onClick={handleStart}
              disabled={running}
            >
              {running ? "Searching…" : "Start lead search"}
            </button>
            <Link className="btn btn-secondary" href={`/projects/${params.id}`}>
              Back to project
            </Link>
          </div>
          {notice && (
            <p className="muted" style={{ marginTop: "16px" }}>
              {notice}
            </p>
          )}
          {limitReached && (
            <div className="notice" style={{ marginTop: "24px" }}>
              <p style={{ margin: 0 }}>
                Limit reached. Upgrade to unlock more runs and keep refining your search.
              </p>
              <div className="cta-row" style={{ marginTop: "12px" }}>
                <button className="btn btn-primary" disabled>
                  Upgrade now
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
