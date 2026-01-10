"use client";

import { useCallback, useEffect, useState } from "react";

export type SessionUser = {
  id: string;
  email?: string;
  app_metadata?: {
    plan?: "FREE" | "PRO";
  };
};

type UserState = {
  user: SessionUser | null;
  status: "loading" | "authenticated" | "unauthenticated" | "error";
};

const initialState: UserState = {
  user: null,
  status: "loading",
};

export function useUser() {
  const [state, setState] = useState<UserState>(initialState);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "loading" }));
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setState({ user: null, status: "unauthenticated" });
        return;
      }
      const payload = (await response.json()) as { user: SessionUser | null };
      setState({
        user: payload.user,
        status: payload.user ? "authenticated" : "unauthenticated",
      });
    } catch (error) {
      console.error("Failed to fetch user", error);
      setState({ user: null, status: "error" });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, status: "unauthenticated" });
  }, []);

  return {
    ...state,
    refresh,
    logout,
  };
}
