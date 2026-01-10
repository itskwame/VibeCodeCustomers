import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getConversationById, getProject } from "@/lib/db";
import { generateAnalysis } from "@/lib/ai";

const bodySchema = z.object({
  conversationId: z.string().uuid(),
});

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const payload = await req.json().catch(() => ({}));
  const parse = bodySchema.safeParse(payload);

  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await getConversationById(parse.data.conversationId, null, supabase);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const project = await getProject(conversation.project_id, userData.user.id, supabase);
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const context = {
    title: conversation.title,
    excerpt: conversation.excerpt,
    subreddit: conversation.subreddit,
    productDescription: project.product_description,
  };

  const analysis = await generateAnalysis(context);

  const { error } = await supabase
    .from("conversations")
    .update({
      ai_summary: analysis.summary,
      ai_pain_points: analysis.painPoints,
      ai_why_matched: analysis.whyMatched,
      last_analyzed_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  if (error) {
    console.error("ai analyze update error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    aiSummary: analysis.summary,
    aiPainPoints: analysis.painPoints,
    aiWhyMatched: analysis.whyMatched,
  });
}
