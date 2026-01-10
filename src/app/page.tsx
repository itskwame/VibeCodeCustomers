import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export default function Home() {
  return (
    <div className="page">
      <AppNav />
      <div className="container">
        <section className="hero">
          <div className="fade-in">
            <div className="tag">For Vibe Coders / Indie Hackers</div>
            <h1 className="hero-title">
              Find real customer conversations and reply with <em>help-first</em>{" "}
              drafts.
            </h1>
            <p className="hero-sub">
              VibeCodeCustomers turns scattered Reddit threads into a repeatable
              workflow: discover, understand pain, and craft value-first replies
              that never feel spammy.
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/login">
                Create your first project
              </Link>
              <Link className="btn btn-secondary" href="/pricing">
                See pricing
              </Link>
            </div>
          </div>
          <div className="hero-card stagger">
            <h3>Discovery scoreboard</h3>
            <p className="muted">
              Track which conversations are worth your time and why they matched.
            </p>
            <div className="grid-3">
              <div className="card">
                <div className="pill">Relevance</div>
                <h3>92</h3>
                <p className="muted">Strong fit based on keywords + context.</p>
              </div>
              <div className="card">
                <div className="pill">Pain points</div>
                <h3>3</h3>
                <p className="muted">Pricing clarity, onboarding friction, trust.</p>
              </div>
              <div className="card">
                <div className="pill">Draft</div>
                <h3>Ready</h3>
                <p className="muted">Tone set to helpful, medium length.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">Why it works</h2>
          <div className="grid-3 stagger">
            <div className="card">
              <h3>Context-first discovery</h3>
              <p className="muted">
                Pulls real Reddit posts and scores them so you stop guessing.
              </p>
            </div>
            <div className="card">
              <h3>Explainable AI analysis</h3>
              <p className="muted">
                See summaries, pain points, and why each thread is worth it.
              </p>
            </div>
            <div className="card">
              <h3>Value-first replies</h3>
              <p className="muted">
                Drafts that help the original poster without pushing a pitch.
              </p>
            </div>
          </div>
        </section>

        <section className="footer">
          <div>Built for builders who ship fast.</div>
          <div className="muted">No auto-posting. Copy only.</div>
        </section>
      </div>
    </div>
  );
}
