"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { normalizeProjectUrl, updateProject, fetchProject, AppProject } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { status } = useUser();
  const [project, setProject] = useState<AppProject | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [buildingNotes, setBuildingNotes] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!id || status !== "authenticated") {
      return;
    }
    setInitialLoading(true);
    void fetchProject(id)
      .then((data) => {
        if (!data) {
          setProject(null);
          return;
        }
        setProject(data);
        setName(data.name);
        setUrl(data.url ?? "");
        setDescription(data.building ?? "");
        setTargetCustomer(data.targetCustomer ?? "");
        setBuildingNotes(data.notes ?? "");
      })
      .finally(() => setInitialLoading(false));
  }, [id, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) {
      return;
    }
    setError("");
    const normalizedUrl = normalizeProjectUrl(url);
    if (!normalizedUrl) {
      setError("A valid URL is required.");
      return;
    }
    setLoading(true);
    try {
      const updated = await updateProject(id, {
        name,
        url: normalizedUrl,
        building: description,
        targetCustomer,
        notes: buildingNotes,
      });
      if (updated) {
        router.push(`/projects/${id}`);
      } else {
        setError("Unable to update the project.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to update the project.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || initialLoading) {
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
            Project not found.
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
          <header className="flex-between">
            <div>
              <h1>Edit project</h1>
              <p className="muted">Adjust the details for {project.name}</p>
            </div>
            <Link className="btn btn-outline" href={`/projects/${project.id}`}>
              Back to project
            </Link>
          </header>
          <form className="panel" onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
            <div className="field">
              <label>Project name</label>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="field">
              <label>Project URL</label>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                type="url"
                required
                placeholder="https://example.com"
              />
            </div>
            <div className="field">
              <label>What it does</label>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe what you’re building (optional)"
              />
            </div>
            <div className="field">
              <label>Target customer</label>
              <input
                value={targetCustomer}
                onChange={(event) => setTargetCustomer(event.target.value)}
                placeholder="Who are you building for?"
              />
            </div>
            <div className="field">
              <label>Building notes</label>
              <textarea
                value={buildingNotes}
                onChange={(event) => setBuildingNotes(event.target.value)}
                placeholder="Any extra context (optional)"
                rows={3}
              />
            </div>
            {error && <div className="notice">{error}</div>}
            <div className="cta-row">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </button>
              <Link className="btn btn-secondary" href={`/projects/${project.id}`}>
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
