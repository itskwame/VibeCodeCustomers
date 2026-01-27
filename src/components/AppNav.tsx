"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/dashboard#projects" },
  { label: "Saved Leads", href: "/leads/saved" },
  { label: "Settings", href: "/settings" },
];

export function AppNav() {
  const { user, status, logout } = useUser();
  const pathname = usePathname();

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    if (!base) {
      return false;
    }
    return pathname === base || (base !== "/" && pathname?.startsWith(base));
  };

  return (
    <nav className="nav">
      <Link href="/" className="logo">
        VibeCodeCustomers
      </Link>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${isActive(item.href) ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
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
