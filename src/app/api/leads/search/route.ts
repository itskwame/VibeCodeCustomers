import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProject } from "@/lib/db";
import {
  computeLeadCacheKey,
  DEFAULT_LEAD_SITES,
  LeadSite,
  LeadSearchTimeWindow,
  resolveLeadKeywords,
  searchLeads,
  SerpApiError,
} from "@/lib/serpapi";
import { incrementDailyDiscoveryCount, checkDailyLimit } from "@/lib/supabaseAdmin";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

const siteEnum = z.enum(["reddit", "hackernews", "indiehackers", "github"]);

const searchSchema = z.object({
  projectId: z.string().uuid(),
  sites: z.array(siteEnum).min(1).default(DEFAULT_LEAD_SITES),
  timeWindow: z.enum(["7", "30"]).default("30"),
  limit: z.union([z.literal(5), z.literal(10), z.literal(20)]).default(10),
  excludeArticles: z.boolean().default(true),
  forceRefresh: z.boolean().optional(),
});

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const payload = await req.json().catch(() => ({}));
  const parse = searchSchema.safeParse(payload);

  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const search = parse.data;
  const forceRefresh = search.forceRefresh ?? false;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? (isDev() ? DEV_USER_ID : null);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProject(search.projectId, userId, supabase);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const limitCheck = await checkDailyLimit(userId, "discovery", 10);
  if (limitCheck.exceeds) {
    return NextResponse.json(
      { error: "Daily lead search limit exceeded. Try again tomorrow." },
      { status: 429 }
    );
  }

  const keywords = resolveLeadKeywords(project);
  const cacheKey = computeLeadCacheKey({
    userId,
    projectId: project.id,
    sites: search.sites as LeadSite[],
    timeWindow: search.timeWindow as LeadSearchTimeWindow,
    limit: search.limit,
    excludeArticles: search.excludeArticles,
    keywords,
  });

  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from("lead_search_cache")
      .select("payload")
      .eq("user_id", userId)
      .eq("project_id", project.id)
      .eq("query_hash", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached?.payload?.results) {
      return NextResponse.json({ results: cached.payload.results, cached: true });
    }
  }

  let searchResult;
  try {
    searchResult = await searchLeads({
      keywords,
      sites: search.sites as LeadSite[],
      timeWindow: search.timeWindow as LeadSearchTimeWindow,
      limit: search.limit,
      excludeArticles: search.excludeArticles,
    });
  } catch (error) {
    if (error instanceof SerpApiError && error.status === 429) {
      return NextResponse.json(
        { error: "Search provider rate-limited, try again soon." },
        { status: 429 }
      );
    }
    console.error("lead search failed", error);
    return NextResponse.json({ error: "Lead search failed" }, { status: 500 });
  }

  const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  void supabase.from("lead_search_cache").upsert(
    {
      user_id: userId,
      project_id: project.id,
      query_hash: cacheKey,
      payload: { results: searchResult.results, query: searchResult.query },
      expires_at: expiresAt,
    },
    { onConflict: "user_id,project_id,query_hash" }
  );

  try {
    await incrementDailyDiscoveryCount(
      userId,
      limitCheck.counts.discovery_count,
      limitCheck.hasRecord
    );
  } catch (error) {
    console.error("Failed to increment daily lead usage", error);
  }

  return NextResponse.json({ results: searchResult.results, cached: false });
}
