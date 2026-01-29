"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { runDiscovery } from "@/lib/mockAppData";

export default function DiscoverRunner({
  projectId,
  onDone,
}: {
  projectId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ranRef = useRef(false);

  const shouldRun = useMemo(
    () => searchParams.get("discover") === "1",
    [searchParams]
  );

  useEffect(() => {
    if (!projectId) return;
    if (!shouldRun) return;
    if (ranRef.current) return;

    ranRef.current = true;

    (async () => {
      await runDiscovery(projectId);

      // remove query param
      router.replace(pathname);

      // force the leads page to refetch state
      onDone();
    })();
  }, [projectId, shouldRun, router, pathname, onDone]);

  return null;
}
