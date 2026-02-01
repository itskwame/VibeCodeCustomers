import type { DiscoveryRunResult } from "@/lib/sprint7Types";

export type StoredRun = DiscoveryRunResult & { projectId: string };

const runHistory: Record<string, StoredRun[]> = {};

export function saveRun(projectId: string, run: DiscoveryRunResult): void {
  const stored: StoredRun = { ...run, projectId };
  runHistory[projectId] = [stored, ...(runHistory[projectId] ?? [])];
}

export function getLatestRun(projectId: string): StoredRun | null {
  const history = runHistory[projectId];
  return history && history.length > 0 ? history[0] : null;
}

export function getRunHistory(projectId: string): StoredRun[] {
  const history = runHistory[projectId];
  return history ? [...history] : [];
}

export function getLeads(projectId: string): DiscoveryRunResult["leads"] {
  return getLatestRun(projectId)?.leads ?? [];
}
