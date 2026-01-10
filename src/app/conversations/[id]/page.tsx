"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { useUser } from "@/lib/hooks/useUser";

type ConversationDetail = {
  id: string;
  title: string;
  excerpt: string;
  relevance_score: number;
  ai_summary: string | null;
  ai_pain_points: string[] | null;
  ai_why_matched: string | null;
  url: string;
  subreddit: string;
};

type PageProps = {
  params: {
    id: string;
  };
};

export default function ConversationDetailPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { status } = useUser();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [tone, setTone] = useState<"helpful" | "casual" | "professional">("helpful");
  const [length, setLength] = useState<"short" | "medium" | "long">("short");
  const [draftStatus, setDraftStatus] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const fetchConversation = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/conversations/${id}`, { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json();
          setConversation(payload.conversation ?? null);
        }
      } catch (error) {
        console.error("load conversation", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchConversation();
  }, [id, status]);

  const handleAnalyze = async () => {
    setAnalysisLoading(true);
    setAnalysisStatus("");
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setAnalysisStatus(payload.error ?? "Analysis failed.");
        return;
      }
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              ai_summary: payload.aiSummary,
              ai_pain_points: payload.aiPainPoints,
              ai_why_matched: payload.aiWhyMatched,
            }
          : prev
      );
      setAnalysisStatus("Analysis updated.");
    } catch (error) {
      console.error("analysis error", error);
      setAnalysisStatus("Analysis request failed.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleDraft = async () => {
    setDraftLoading(true);
    setDraftStatus("");
    try {
      const response = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id, tone, length }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setDraftStatus(payload.error ?? "Draft generation failed.");
        return;
      }
      setDraftContent(payload.draft?.content ?? "");
      setDraftStatus("Draft generated. Edit before copying.");
    } catch (error) {
      console.error("draft error", error);
      setDraftStatus("Draft call failed.");
    } finally {
      setDraftLoading(false);
    }
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(draftContent);
    setDraftStatus("Copied to clipboard.");
  };

  if (loading || status === "loading" || status === "unauthenticated") {
    return (
      <div className="page">
        <AppNav />
        <div className="container">
          <div className="notice">Loading conversation…</div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="page">
        <AppNav />
        <div className="container">
          <div className="notice">Unable to load that conversation.</div>
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
            <h1>{conversation.title}</h1>
            <p className="muted">
              r/{conversation.subreddit} • relevance {conversation.relevance_score}
            </p>
          </div>
          <a className="btn btn-secondary" href={conversation.url} target="_blank" rel="noreferrer">
            Source thread
          </a>
        </header>
        <section className="hero-card" style={{ marginTop: "24px" }}>
          <h3>AI Analysis</h3>
          <p className="muted">Summary + pain points + explainability.</p>
          <p>
            <strong>Summary:</strong> {conversation.ai_summary ?? "Not generated yet."}
          </p>
          <p>
            <strong>Pain points:</strong>{" "}
            {conversation.ai_pain_points?.length
              ? conversation.ai_pain_points.join(", ")
              : "None extracted yet."}
          </p>
          <p>
            <strong>Why it matched:</strong> {conversation.ai_why_matched ?? "No explanation yet."}
          </p>
          <div className="cta-row">
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={analysisLoading}>
              {analysisLoading ? "Analyzing…" : "Refresh analysis"}
            </button>
          </div>
          {analysisStatus && <div className="muted">{analysisStatus}</div>}
        </section>

        <section className="hero-card" style={{ marginTop: "24px" }}>
          <h3>Draft response</h3>
          <div className="field">
            <label>Tone</label>
            <select value={tone} onChange={(event) => setTone(event.target.value as typeof tone)}>
              <option value="helpful">Helpful</option>
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <div className="field">
            <label>Length</label>
            <select value={length} onChange={(event) => setLength(event.target.value as typeof length)}>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
          <textarea
            className="field"
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            rows={6}
            placeholder="Generate or edit a draft here."
          />
          <div className="cta-row">
            <button className="btn btn-primary" onClick={handleDraft} disabled={draftLoading}>
              {draftLoading ? "Generating…" : "Generate draft"}
            </button>
            <button className="btn btn-secondary" onClick={handleCopy} disabled={!draftContent}>
              Copy draft
            </button>
          </div>
          {draftStatus && <div className="muted">{draftStatus}</div>}
        </section>
      </div>
    </div>
  );
}
