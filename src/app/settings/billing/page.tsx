"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { PLAN_TIERS } from "@/lib/mockAppData";
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
              Billing coming in Sprint 8 — once Stripe is connected you'll be able to manage tiers, invoices, and payment
              details right here.
            </p>
          </div>
        </section>
        <section className="grid-2" style={{ marginTop: "24px" }}>
          {PLAN_TIERS.map((tier) => (
            <article key={tier.id} className={`card ${tier.id === "starter" ? "featured" : ""}`}>
              <div className="flex-between">
                <h3>{tier.label}</h3>
                <span className="muted">{tier.price}</span>
              </div>
              <p className="muted" style={{ marginTop: "6px" }}>
                {tier.description}
              </p>
              <ul className="muted" style={{ marginTop: "12px", paddingLeft: "18px", lineHeight: "1.6" }}>
                <li>
                  Runs: {tier.runsCap} {tier.period === "monthly" ? "per month" : "total limit"}
                </li>
                <li>
                  Leads: {tier.leadsCap} {tier.period === "monthly" ? "per month" : "total limit"}
                </li>
              </ul>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
