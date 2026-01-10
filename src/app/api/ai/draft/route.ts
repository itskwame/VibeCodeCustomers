import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getConversationById, getProject } from "@/lib/db";
import { generateDraft } from "@/lib/ai";
import { incrementUsageEvent } from "@/lib/usage";

const bodySchema = z.object({
  conversationId: z.string().uuid(),
  tone: z.enum(["helpful", "casual", "professional"]),
  length: z.enum(["short", "medium", "long"]),
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

  const draftContent = await generateDraft(
    {
      title: conversation.title,
      excerpt: conversation.excerpt,
      subreddit: conversation.subreddit,
      productDescription: project.product_description,
    },
    {
      tone: parse.data.tone,
      length: parse.data.length,
    }
  );

  const { data, error } = await supabase.from("drafts").insert({
    conversation_id: conversation.id,
    user_id: userData.user.id,
    tone: parse.data.tone,
    length: parse.data.length,
    content: draftContent,
  });

  if (error) {
    console.error("draft insert error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await incrementUsageEvent(supabase, userData.user.id, "DRAFT_GENERATION");

  return NextResponse.json({
    draft: data?.[0] ?? null,
  });
}
