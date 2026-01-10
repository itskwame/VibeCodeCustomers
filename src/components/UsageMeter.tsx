"use client";

import { UsageType } from "@/lib/usage";

type PlanLimits = {
  projects: number;
  conversations: number;
  drafts: number;
};

type UsageMeterProps = {
  usage: Record<UsageType, number>;
  projectCount?: number;
  limits: PlanLimits;
  planLabel?: string;
  className?: string;
};

const USAGE_LABELS: Record<UsageType, string> = {
  DISCOVERY_CONVERSATION: "Conversations",
  DRAFT_GENERATION: "Drafts",
};

export function UsageMeter({ usage, projectCount = 0, limits, planLabel, className }: UsageMeterProps) {
  const rows = [
    { label: "Projects", value: projectCount, limit: limits.projects },
    { label: "Conversations / month", value: usage.DISCOVERY_CONVERSATION, limit: limits.conversations },
    { label: "Drafts / month", value: usage.DRAFT_GENERATION, limit: limits.drafts },
  ];

  return (
    <div className={`panel usage-panel ${className ?? ""}`}>
      <div className="flex-between">
        <div>
          <strong>Usage ○ {planLabel ?? "Free plan"}</strong>
        </div>
        <span className="tag">{planLabel ?? "Free"}</span>
      </div>

      {rows.map((row) => {
        const percent = Math.min(100, (row.value / Math.max(row.limit, 1)) * 100);
        return (
          <div className="field" key={row.label}>
            <label>
              {row.label}: {row.value} / {row.limit}
            </label>
            <div className="meter">
              <div className="meter-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
