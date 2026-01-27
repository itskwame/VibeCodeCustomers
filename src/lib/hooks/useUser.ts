"use client";

import { useCallback, useEffect, useState } from "react";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

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

const DEV_SESSION_USER: SessionUser = {
  id: DEV_USER_ID,
};

const getInitialState = (): UserState => {
  return isDev()
    ? { user: DEV_SESSION_USER, status: "authenticated" }
    : { user: null, status: "loading" };
};

export function useUser() {
  const [state, setState] = useState<UserState>(getInitialState);

  const refresh = useCallback(async () => {
    if (isDev()) {
      setState({ user: DEV_SESSION_USER, status: "authenticated" });
      return;
    }
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
    if (isDev()) {
      setState({ user: DEV_SESSION_USER, status: "authenticated" });
      return;
    }
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    if (isDev()) {
      setState({ user: null, status: "unauthenticated" });
      return;
    }
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, status: "unauthenticated" });
  }, []);

  return {
    ...state,
    refresh,
    logout,
  };
}
