"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { runDiscovery } from "@/lib/mockAppData";

export default function DiscoverRunner({ projectId }: { projectId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const ranRef = useRef(false);

  const shouldRun = useMemo(() => {
    return searchParams.get("discover") === "1";
  }, [searchParams]);

  useEffect(() => {
    if (!projectId) return;
    if (!shouldRun) return;
    if (ranRef.current) return;

    ranRef.current = true;

    (async () => {
      try {
        await runDiscovery(projectId);
      } catch (e) {
        // ignore
      } finally {
        router.refresh();
        router.replace(pathname);
        window.setTimeout(() => {
          if (window.location.search.includes("discover=1")) {
            window.location.replace(pathname);
          }
        }, 250);
      }
    })();
  }, [projectId, shouldRun, router, pathname]);

  return null;
}
