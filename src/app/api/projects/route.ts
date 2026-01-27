import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

const bodySchema = z.object({
  name: z.string().min(3),
  productDescription: z.string().min(10),
  keywords: z.array(z.string()).min(1),
  subreddits: z.array(z.string()).optional().default([]),
  targetUser: z.string().optional(),
});

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? (isDev() ? DEV_USER_ID : null);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? (isDev() ? DEV_USER_ID : null);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({}));
  const parse = bodySchema.safeParse(payload);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data, error } = await supabase.from("projects").insert({
    user_id: userId,
    name: parse.data.name,
    product_description: parse.data.productDescription,
    keywords: parse.data.keywords,
    subreddits: parse.data.subreddits,
    target_user: parse.data.targetUser ?? null,
    is_archived: false,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
