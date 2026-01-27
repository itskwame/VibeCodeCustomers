import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProject } from "@/lib/db";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

const saveSchema = z.object({
  projectId: z.string().uuid(),
  url: z.string().url(),
  title: z.string().min(5),
  snippet: z.string().min(5),
  score: z.number().min(0).max(100),
  source: z.string().min(1),
  publishedAt: z.string().optional(),
});

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const payload = await req.json().catch(() => ({}));
  const parse = saveSchema.safeParse(payload);

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

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", userId)
    .eq("project_id", project.id)
    .eq("url", parse.data.url)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: "already saved" });
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("conversations").insert({
    user_id: userId,
    project_id: project.id,
    url: parse.data.url,
    title: parse.data.title,
    excerpt: parse.data.snippet,
    score: Math.round(parse.data.score),
    relevance_score: Math.round(parse.data.score),
    source: parse.data.source,
    platform_created_at: parse.data.publishedAt ?? now,
    found_at: now,
  });

  if (error) {
    console.error("save lead conversation error", error);
    return NextResponse.json({ error: "Unable to save lead" }, { status: 500 });
  }

  return NextResponse.json({ message: "saved" });
}
