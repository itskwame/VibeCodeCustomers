import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export default function PricingPage() {
  return (
    <div className="page">
      <AppNav />
      <div className="container">
        <section className="hero">
          <div>
            <div className="tag">Plans</div>
            <h1 className="hero-title">
              Start free, upgrade when you want more conversations.
            </h1>
            <p className="hero-sub">
              Free keeps you honest with limits. Pro is for daily customer
              discovery runs.
            </p>
          </div>
          <div className="hero-card">
            <h3>Free</h3>
            <p className="muted">1 project, 10 conversations/month, 5 drafts.</p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/login">
                Get started
              </Link>
            </div>
          </div>
        </section>

        <section className="grid-3">
          <div className="card">
            <h3>Pro</h3>
            <p className="muted">$29/mo. More projects, high-volume discovery.</p>
            <p className="muted">Unlimited drafts, prioritised AI analysis.</p>
          </div>
          <div className="card">
            <h3>Ethical by design</h3>
            <p className="muted">
              We block spammy language and keep replies value-first.
            </p>
          </div>
          <div className="card">
            <h3>Fast to value</h3>
            <p className="muted">Your first usable reply in under 2 minutes.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
