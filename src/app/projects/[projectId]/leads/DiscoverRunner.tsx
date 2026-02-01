"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { runDiscovery } from "@/lib/mockAppData";

export type DiscoveryResult = {
  limitReached: boolean;
  runId?: string;
  message?: string;
};

export default function DiscoverRunner({
  projectId,
  userId,
  onStart,
  onSuccess,
  onError,
}: {
  projectId: string;
  userId: string;
  onStart?: () => void;
  onSuccess?: (result: DiscoveryResult) => void;
  onError?: (error: unknown) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ranRef = useRef(false);

  const shouldRun = useMemo(() => searchParams.get("discover") === "1", [searchParams]);

  useEffect(() => {
    if (!shouldRun) {
      ranRef.current = false;
    }
  }, [shouldRun]);

  useEffect(() => {
    if (!projectId || !userId) return;
    if (!shouldRun) return;
    if (ranRef.current) return;

    ranRef.current = true;
    onStart?.();

    (async () => {
      try {
        const result = await runDiscovery(userId, projectId);
        onSuccess?.(result);
      } catch (error) {
        onError?.(error);
      } finally {
        router.replace(pathname);
        if (typeof window !== "undefined") {
          window.setTimeout(() => {
            if (window.location.search.includes("discover=1")) {
              window.location.replace(pathname);
            }
          }, 250);
        }
      }
    })();
  }, [projectId, userId, shouldRun, router, pathname, onStart, onSuccess, onError]);

  return null;
}
