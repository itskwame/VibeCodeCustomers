"use client";

import Link from "next/link";
import { useUser } from "@/lib/hooks/useUser";

export function AppNav() {
  const { user, status, logout } = useUser();

  return (
    <nav className="nav">
      <div className="logo">VibeCodeCustomers</div>
      <div className="nav-links">
        <Link href="/" className="nav-link">
          Home
        </Link>
        <Link href="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link href="/pricing" className="nav-link">
          Pricing
        </Link>
        <Link href="/settings/billing" className="nav-link">
          Billing
        </Link>
      </div>
      <div className="nav-actions">
        {status === "loading" && <span className="muted">Checking auth…</span>}
        {status === "authenticated" && user && (
          <button className="btn btn-secondary" onClick={() => void logout()}>
            Sign out
          </button>
        )}
        {status !== "authenticated" && (
          <Link className="btn btn-primary" href="/login">
            Log in / Sign up
          </Link>
        )}
      </div>
    </nav>
  );
}
