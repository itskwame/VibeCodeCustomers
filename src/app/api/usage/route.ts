import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPeriodKey, PLAN_LIMITS, summarizeUsage } from "@/lib/usage";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? (isDev() ? DEV_USER_ID : null);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const periodKey = url.searchParams.get("periodKey") ?? getPeriodKey();

  const { data, error } = await supabase
    .from("usage_events")
    .select("type, count")
    .eq("user_id", userId)
    .eq("period_key", periodKey);

  if (error) {
    console.error("usage fetch error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const plan = (userData.user?.app_metadata?.plan as "FREE" | "PRO" | undefined) ?? (isDev() ? "PRO" : "FREE");
  return NextResponse.json({
    usage: summarizeUsage(data ?? []),
    periodKey,
    limits: PLAN_LIMITS[plan],
    plan,
  });
}
