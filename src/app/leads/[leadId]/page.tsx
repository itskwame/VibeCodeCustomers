"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchLeadById, updateLeadStatus, AppLead } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";
import Link from "next/link";

export default function LeadDetailPage() {
  const router = useRouter();
  const { status } = useUser();
  const [lead, setLead] = useState<AppLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const routeParams = useParams<{ leadId: string }>();
  const leadId = routeParams?.leadId;

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!leadId || status !== "authenticated") {
      return;
    }
    setLoading(true);
    void fetchLeadById(leadId)
      .then((data) => setLead(data ?? null))
      .finally(() => setLoading(false));
  }, [status, leadId]);

  const handleCopy = async () => {
    if (!lead) {
      return;
    }
    try {
      await navigator.clipboard.writeText(lead.suggested_replies[0]);
      setStatusMessage("Reply copied.");
    } catch {
      setStatusMessage("Unable to copy reply.");
    }
  };

  const changeStatus = async (statusValue: "replied" | "ignored") => {
    if (!lead) {
      return;
    }
    const updated = await updateLeadStatus(lead.id, statusValue);
    setLead(updated ?? lead);
    setStatusMessage(
      statusValue === "replied" ? "Lead marked as replied." : "Lead marked as ignored."
    );
  };

  if (status === "loading" || loading) {
    return (
      <AppShell>
        <div className="container">
          <div className="notice" style={{ marginTop: "40px" }}>
            Loading lead…
          </div>
        </div>
      </AppShell>
    );
  }

  if (!lead) {
    return (
      <AppShell>
        <div className="container">
          <div className="notice" style={{ marginTop: "40px" }}>
            Lead not found.
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
              <h1>{lead.title}</h1>
              <p className="muted" style={{ marginTop: "8px" }}>
                {lead.context}
              </p>
            </div>
            <Link className="btn btn-secondary" href={`/projects/${lead.projectId}/leads`}>
              Back to leads
            </Link>
          </header>
          <p className="muted" style={{ marginTop: "16px" }}>
            Original post:{" "}
            <a href={lead.post_url} target="_blank" rel="noreferrer">
              {lead.post_url}
            </a>
          </p>
          <p className="muted" style={{ marginTop: "12px" }}>
            Why it qualifies: {lead.why_qualifies}
          </p>
          <div className="helper-copy" style={{ marginTop: "18px" }}>
            You can copy these as-is, or tweak them to sound like you. The goal is to be helpful and natural, not salesy.
          </div>
          <div className="lead-replies">
            {lead.suggested_replies.map((reply, index) => (
              <article key={index} className="reply-block">
                <p>
                  <strong>Reply {index + 1}</strong>
                </p>
                <p>{reply}</p>
              </article>
            ))}
          </div>
          <div className="reply-actions">
            <button className="btn btn-primary" onClick={handleCopy}>
              Copy reply
            </button>
            <button className="btn btn-secondary" onClick={() => void changeStatus("replied")}>
              Mark as replied
            </button>
            <button className="btn btn-outline" onClick={() => void changeStatus("ignored")}>
              Mark as ignored
            </button>
            <button className="btn btn-outline" disabled>
              Rewrite reply
            </button>
          </div>
          {statusMessage && (
            <p className="muted" style={{ marginTop: "12px" }}>
              {statusMessage}
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
