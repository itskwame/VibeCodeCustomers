"use client";

import { useEffect } from "react";
import { AppNav } from "@/components/AppNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const previousTheme = document.body.dataset.theme;
    document.body.dataset.theme = "light";
    return () => {
      document.body.dataset.theme = previousTheme ?? "dark";
    };
  }, []);

  return (
    <div className="app-shell">
      <AppNav />
      <main className="app-content">{children}</main>
    </div>
  );
}
