"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useUser } from "@/lib/hooks/useUser";
import { isDev } from "@/lib/devAuth";

export default function SettingsPage() {
  const { status, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && !isDev()) {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <AppShell>
      <div className="container">
        <section className="hero-card" style={{ marginTop: "40px" }}>
          <header className="flex-between">
            <div>
              <h1>Settings</h1>
              <p className="muted">Manage your profile, plan, and usage.</p>
            </div>
          </header>
          <div className="settings-grid" style={{ marginTop: "24px" }}>
            <article className="settings-card">
              <h3>Profile</h3>
              <p className="muted">
                Email used to sign in: <strong>{user?.email ?? "—"}</strong>
              </p>
              <Link className="btn btn-outline" href="/settings#profile">
                Update profile
              </Link>
            </article>
            <article className="settings-card">
              <h3>Plan</h3>
              <p className="muted">Change or upgrade your plan at any time.</p>
              <Link className="btn btn-primary" href="/settings/billing">
                View plan
              </Link>
            </article>
            <article className="settings-card">
              <h3>Usage</h3>
              <p className="muted">Monitor leads, replies, and reset dates.</p>
              <Link className="btn btn-secondary" href="/settings/usage">
                View usage
              </Link>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
