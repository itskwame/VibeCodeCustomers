"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { UsageMeter } from "@/components/UsageMeter";
import { useUser } from "@/lib/hooks/useUser";
import type { UsageType } from "@/lib/usage";

type UsageResponse = {
  usage: Record<UsageType, number>;
  limits: {
    projects: number;
    conversations: number;
    drafts: number;
  };
  plan?: "FREE" | "PRO";
};

export default function BillingSettingsPage() {
  const router = useRouter();
  const { status } = useUser();
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutStatus, setCheckoutStatus] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    const fetchUsage = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/usage", { cache: "no-store" });
        if (response.ok) {
          const body = await response.json();
          setUsage(body);
        }
      } catch (error) {
        console.error("usage fetch", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchUsage();
  }, [status]);

  const handleCheckout = async () => {
    setCheckoutStatus("Creating checkout session…");
    try {
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "PRO" }),
      });
      const body = await response.json();
      if (response.ok && body.url) {
        window.location.href = body.url;
        return;
      }
      setCheckoutStatus(body.error ?? "Unable to start checkout.");
    } catch (error) {
      console.error("checkout error", error);
      setCheckoutStatus("Checkout request failed.");
    }
  };

  return (
    <div className="page">
      <AppNav />
      <div className="container">
        <header className="flex-between">
          <div>
            <h1>Billing & plan</h1>
            <p className="muted">View plan limits, usage, and upgrade to Pro.</p>
          </div>
        </header>
        {usage && (
          <UsageMeter
            usage={usage.usage}
            limits={usage.limits}
            planLabel={usage.plan}
            className="usage-panel"
          />
        )}
        <section className="hero-card" style={{ marginTop: "32px" }}>
          <h3>Pro plan</h3>
          <p className="muted">$29/month • Remove limits, prioritized AI.</p>
          <div className="cta-row">
            <button className="btn btn-primary" onClick={handleCheckout}>
              Upgrade to Pro
            </button>
          </div>
          {checkoutStatus && <div className="notice">{checkoutStatus}</div>}
        </section>
      </div>
    </div>
  );
}
