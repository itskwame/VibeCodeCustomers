"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { useUser } from "@/lib/hooks/useUser";

type Conversation = {
  id: string;
  title: string;
  excerpt: string;
  relevance_score: number;
  ai_summary: string | null;
  ai_pain_points: string[] | null;
  ai_why_matched: string | null;
  subreddit: string;
  author: string;
  created_at: string;
};

type PageProps = {
  params: {
    id: string;
  };
};

export default function ProjectConversationsPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { status } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/conversations?projectId=${id}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const payload = await response.json();
          setConversations(payload.conversations ?? []);
        }
      } catch (error) {
        console.error("fetch conversations failed", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchConversations();
  }, [id, status]);

  const handleDiscover = async () => {
    setDiscovering(true);
    setNotice("");
    try {
      const response = await fetch("/api/conversations/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setNotice(payload.error ?? "Discovery failed.");
      } else {
        setNotice(`Added ${payload.conversationsAdded} conversations.`);
        void router.replace(`/projects/${id}/conversations`);
      }
    } catch (error) {
      console.error("discover error", error);
      setNotice("Cannot reach discovery API right now.");
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="page">
      <AppNav />
      <div className="container">
        <header className="flex-between">
          <div>
            <h1>Conversations</h1>
            <p className="muted">View AI summaries & craft drafts.</p>
          </div>
          <button className="btn btn-primary" onClick={handleDiscover} disabled={discovering}>
            {discovering ? "Discovering…" : "Run discovery"}
          </button>
        </header>
        {notice && <div className="notice">{notice}</div>}
        <section className="grid-3" style={{ marginTop: "24px" }}>
          {loading ? (
            <div className="card">Loading conversations…</div>
          ) : conversations.length === 0 ? (
            <div className="card">
              <h3>No conversations yet</h3>
              <p className="muted">Run discovery to pull Reddit threads for this project.</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/conversations/${conversation.id}`}
                className="card"
              >
                <div className="flex-between">
                  <h3>{conversation.title}</h3>
                  <div className="pill">{conversation.relevance_score}</div>
                </div>
                <p className="muted">{conversation.excerpt}</p>
                <p className="muted">
                  r/{conversation.subreddit} • by {conversation.author}
                </p>
                {conversation.ai_summary && (
                  <p className="muted">
                    <strong>AI summary:</strong> {conversation.ai_summary}
                  </p>
                )}
                {conversation.ai_pain_points?.length && (
                  <p className="muted">
                    <strong>Pain points:</strong> {conversation.ai_pain_points.join(", ")}
                  </p>
                )}
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
