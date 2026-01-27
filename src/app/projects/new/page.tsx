"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { createProject } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

export default function NewProjectPage() {
  const router = useRouter();
  const { status } = useUser();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [building, setBuilding] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const project = await createProject({
        name,
        url: url || undefined,
        building,
        targetCustomer,
      });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
      setError("Unable to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="container">
        <section className="hero-card" style={{ marginTop: "40px" }}>
          <header className="flex-between">
            <div>
              <h1>Create a project</h1>
              <p className="muted">Describe what you’ve built and who it helps.</p>
            </div>
            <Link className="btn btn-outline" href="/dashboard">
              Back to dashboard
            </Link>
          </header>
          <form className="panel" onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
            <div className="field">
              <label>Project name</label>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="field">
              <label>Website or GitHub URL (optional)</label>
              <input value={url} onChange={(event) => setUrl(event.target.value)} type="url" />
            </div>
            <div className="field">
              <label>What you're building (1-2 sentences)</label>
              <textarea
                value={building}
                onChange={(event) => setBuilding(event.target.value)}
                rows={3}
                required
                placeholder="Explain the core value in one or two sentences."
              />
            </div>
            <div className="field">
              <label>Target customer</label>
              <input
                value={targetCustomer}
                onChange={(event) => setTargetCustomer(event.target.value)}
                required
                placeholder="Who benefits the most? e.g. bootstrapped founders, community leads"
              />
            </div>
            {error && <div className="notice">{error}</div>}
            <div className="cta-row">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create project"}
              </button>
              <Link className="btn btn-secondary" href="/dashboard">
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
