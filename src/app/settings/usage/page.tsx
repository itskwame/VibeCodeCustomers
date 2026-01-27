"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchProjects, AppProject } from "@/lib/mockAppData";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

export default function UsagePage() {
  const router = useRouter();
  const { status } = useUser();
  const [projects, setProjects] = useState<AppProject[]>([]);

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    void fetchProjects().then(setProjects);
  }, [status]);

  const usageTotals = useMemo(() => {
    return projects.reduce(
      (totals, project) => {
        totals.leads += project.usageThisMonth.leadsFound;
        totals.replies += project.usageThisMonth.repliesSent;
        totals.credits += project.usageThisMonth.creditsUsed;
        return totals;
      },
      { leads: 0, replies: 0, credits: 0 }
    );
  }, [projects]);

  const resetDate = useMemo(() => {
    const next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return next.toLocaleDateString();
  }, []);

  const limit = 50;

  return (
    <AppShell>
      <div className="container">
        <section className="hero-card" style={{ marginTop: "40px" }}>
          <header className="flex-between">
            <div>
              <h1>Usage</h1>
              <p className="muted">Leads, replies, and reset dates.</p>
            </div>
            <Link className="btn btn-secondary" href="/settings">
              Back to settings
            </Link>
          </header>
          <div className="usage-row" style={{ marginTop: "24px" }}>
            <div>
              <strong>{usageTotals.leads}</strong>
              <p className="muted">Leads used</p>
            </div>
            <div>
              <strong>{usageTotals.replies}</strong>
              <p className="muted">Replies sent</p>
            </div>
            <div>
              <strong>{limit}</strong>
              <p className="muted">Lead limit</p>
            </div>
          </div>
          <p className="muted" style={{ marginTop: "16px" }}>
            Reset date: {resetDate}
          </p>
          <div className="cta-row" style={{ marginTop: "24px" }}>
            <button className="btn btn-primary" type="button">
              Upgrade for more credits
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
