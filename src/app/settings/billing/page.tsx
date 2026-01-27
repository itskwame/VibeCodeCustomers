"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

export default function BillingSettingsPage() {
  const { status } = useUser();

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      window.location.replace("/login");
    }
  }, [status]);

  return (
    <AppShell>
      <div className="container">
        <section className="hero-card" style={{ marginTop: "40px" }}>
          <header className="flex-between">
            <div>
              <h1>Billing</h1>
              <p className="muted">Current plan: Free (mock data)</p>
            </div>
            <button className="btn btn-primary" type="button">
              Upgrade
            </button>
          </header>
          <p className="muted" style={{ marginTop: "16px" }}>
            Billing is not enabled yet. This placeholder will show Stripe details once subscriptions go live.
          </p>
          <div className="notice" style={{ marginTop: "20px" }}>
            <p style={{ margin: 0 }}>
              Billing not enabled yet. We'll show invoices, card details, and upgrade links once Stripe is connected.
            </p>
          </div>
          <div className="cta-row" style={{ marginTop: "16px" }}>
            <button className="btn btn-secondary" disabled>
              Manage subscription
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
