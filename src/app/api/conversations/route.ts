import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProject } from "@/lib/db";

const RANGE_TO_DAYS: Record<string, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const project = await getProject(projectId, userData.user.id, supabase);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let query = supabase.from("conversations").select("*").eq("project_id", projectId);

  const minRelevance = url.searchParams.get("minRelevance");
  if (minRelevance) {
    const value = Number(minRelevance);
    if (!Number.isNaN(value)) {
      query = query.gte("relevance_score", value);
    }
  }

  const timeRange = url.searchParams.get("timeRange");
  if (timeRange && timeRange in RANGE_TO_DAYS) {
    const days = RANGE_TO_DAYS[timeRange];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("platform_created_at", since);
  }

  const { data, error } = await query.order("relevance_score", { ascending: false });
  if (error) {
    console.error("conversations list error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}
