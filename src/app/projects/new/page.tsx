"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AppNav } from "@/components/AppNav";
import { useUser } from "@/lib/hooks/useUser";

export default function NewProjectPage() {
  const router = useRouter();
  const { status } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          productDescription: description,
          keywords: keywords.split(",").map((token) => token.trim()).filter(Boolean),
          subreddits: subreddits.split(",").map((token) => token.trim().replace(/^r\//i, "")).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error ?? "Unable to create project");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("create project failed", err);
      setError("Failed to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <AppNav />
      <div className="container">
        <section className="hero-card">
          <h1>Create a project</h1>
          <p className="muted">
            Describe what you are building, add keywords, and the subreddits you
            want to monitor.
          </p>
          <form className="panel" onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="field">
              <label>Product description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="field">
              <label>Keywords (comma separated)</label>
              <input value={keywords} onChange={(event) => setKeywords(event.target.value)} required />
            </div>
            <div className="field">
              <label>Subreddits (comma separated)</label>
              <input value={subreddits} onChange={(event) => setSubreddits(event.target.value)} required />
            </div>
            {error && <div className="notice">{error}</div>}
            <div className="cta-row">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create project"}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
