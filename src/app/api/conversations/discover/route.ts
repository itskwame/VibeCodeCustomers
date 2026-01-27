import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { searchReddit } from "@/lib/reddit";
import { getProject } from "@/lib/db";
import { incrementUsageEvent, UsageType } from "@/lib/usage";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

const bodySchema = z.object({
  projectId: z.string().uuid(),
  timeRange: z.enum(["day", "week", "month", "year", "all"]).default("week"),
});

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const payload = await req.json().catch(() => ({}));
  const parse = bodySchema.safeParse(payload);

  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? (isDev() ? DEV_USER_ID : null);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getProject(parse.data.projectId, userId, supabase);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const results = await searchReddit({
    keywords: project.keywords,
    subreddits: project.subreddits,
    timeRange: parse.data.timeRange,
  });

  const { data, error } = await supabase
    .from("conversations")
    .upsert(
      results.map((r) => ({
        project_id: project.id,
        platform: "REDDIT",
        external_id: r.externalId,
        url: r.url,
        title: r.title,
        author: r.author,
        subreddit: r.subreddit,
        platform_created_at: r.createdAt,
        score: r.score,
        num_comments: r.numComments,
        excerpt: r.excerpt,
        relevance_score: r.relevanceScore,
      })),
      { onConflict: "project_id,external_id" }
    );

  if (error) {
    console.error("discover insert error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await incrementUsageEvent(supabase, userId, "DISCOVERY_CONVERSATION");

  return NextResponse.json({
    conversationsAdded: data?.length ?? 0,
    totalFound: results.length,
  });
}
