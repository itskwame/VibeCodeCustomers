import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPeriodKey, PLAN_LIMITS, summarizeUsage } from "@/lib/usage";

export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const periodKey = url.searchParams.get("periodKey") ?? getPeriodKey();

  const { data, error } = await supabase
    .from("usage_events")
    .select("type, count")
    .eq("user_id", userData.user.id)
    .eq("period_key", periodKey);

  if (error) {
    console.error("usage fetch error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const plan = (userData.user.app_metadata?.plan as "FREE" | "PRO") ?? "FREE";
  return NextResponse.json({
    usage: summarizeUsage(data ?? []),
    periodKey,
    limits: PLAN_LIMITS[plan],
    plan,
  });
}
