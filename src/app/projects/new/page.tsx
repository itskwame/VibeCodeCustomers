"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

export default function NewProjectPage() {
  const router = useRouter();
  const { status } = useUser();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [buildingNotes, setBuildingNotes] = useState("");
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
    const rawUrl = url.trim();
    if (!rawUrl) {
      setError("A valid URL is required.");
      setLoading(false);
      return;
    }
    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("A project name is required.");
      }
      const trimmedDescription = description.trim();
      let productDescription =
        trimmedDescription.length >= 10
          ? trimmedDescription
          : `${trimmedName} ${trimmedDescription || "project"}`;
      if (normalizedUrl) {
        productDescription = `${productDescription}\nWebsite: ${normalizedUrl}`;
      }
      const notesText = buildingNotes.trim();
      if (notesText) {
        productDescription = `${productDescription}\nNotes: ${notesText}`;
      }
      const payload = {
        name: trimmedName,
        productDescription,
        keywords: [trimmedName],
        subreddits: [],
        targetUser: targetCustomer.trim() || undefined,
      };
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.project?.id) {
        throw new Error(result?.error ?? "Unable to create project.");
      }
      router.push(`/projects/${result.project.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to create project.");
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
              <p className="muted">Share your project name and URL to start discovery.</p>
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
              <label>Project URL</label>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                type="text"
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
