import { describe, expect, it } from "vitest";
import { getPeriodKey, summarizeUsage } from "@/lib/usage";

describe("usage helpers", () => {
  it("sums rows even when counts are missing", () => {
    const rows = [
      { type: "DISCOVERY_CONVERSATION", count: 2 },
      { type: "DISCOVERY_CONVERSATION", count: null },
      { type: "DRAFT_GENERATION", count: 5 },
    ] as const;

    expect(summarizeUsage(rows)).toEqual({
      DISCOVERY_CONVERSATION: 2,
      DRAFT_GENERATION: 5,
    });
  });

  it("generates a UTC period key", () => {
    const key = getPeriodKey();
    expect(key).toMatch(/^\d{4}-\d{2}$/);
  });
});
