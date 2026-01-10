export type PlanType = "FREE" | "PRO";

export const PLAN_LIMITS: Record<PlanType, { projects: number; conversations: number; drafts: number }> = {
  FREE: {
    projects: 1,
    conversations: 10,
    drafts: 5,
  },
  PRO: {
    projects: 25,
    conversations: 500,
    drafts: 500,
  },
};

export type UsageType = "DISCOVERY_CONVERSATION" | "DRAFT_GENERATION";

export function getPeriodKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function summarizeUsage(
  rows: Array<{ type: UsageType; count: number | null }>
): Record<UsageType, number> {
  return rows.reduce(
    (acc, row) => {
      const value = typeof row.count === "number" ? row.count : 0;
      acc[row.type] = (acc[row.type] ?? 0) + value;
      return acc;
    },
    {
      DISCOVERY_CONVERSATION: 0,
      DRAFT_GENERATION: 0,
    } as Record<UsageType, number>
  );
}
