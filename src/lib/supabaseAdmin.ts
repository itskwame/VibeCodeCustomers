import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "./env";

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

type CreateProjectInput = {
  user_id: string;
  name: string;
  description?: string;
  keywords?: string[];
  subreddits?: string[];
  targetUser?: string;
};

export async function createProject(input: CreateProjectInput) {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({
      ...input,
      keywords: input.keywords ?? [],
      subreddits: input.subreddits ?? [],
      target_user: input.targetUser ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

type SaveConversationInput = {
  user_id: string;
  project_id: string;
  source_id?: string;
  url: string;
  title: string;
  excerpt?: string;
  author?: string;
  subreddit?: string;
  relevance_score: number;
  ai_summary?: string;
  ai_pain_points?: string[];
  ai_why_matched?: string;
  platform_created_at?: string;
  score?: number;
  num_comments?: number;
};

export async function saveConversation(input: SaveConversationInput) {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({
      ...input,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

type SaveDraftInput = {
  user_id: string;
  project_id: string;
  conversation_id: string;
  tone: string;
  length: string;
  content: string;
};

export async function saveDraft(input: SaveDraftInput) {
  const { data, error } = await supabaseAdmin
    .from("drafts")
    .insert({
      ...input,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

type RecordOutcomeInput = {
  user_id: string;
  project_id: string;
  conversation_id: string;
  status: string;
  details?: Record<string, unknown>;
};

export async function recordOutcome(input: RecordOutcomeInput) {
  const { data, error } = await supabaseAdmin
    .from("outcomes")
    .insert({
      ...input,
      details: input.details ?? {},
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function checkDailyLimit(user_id: string, limitType: "discovery" | "draft", limit: number) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("daily_usage")
    .select("discovery_count, draft_count")
    .eq("user_id", user_id)
    .eq("date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  const counts = data ?? { discovery_count: 0, draft_count: 0 };
  const current =
    limitType === "discovery" ? counts.discovery_count : counts.draft_count;
  const exceeds = current >= limit;

  return { counts, exceeds, hasRecord: Boolean(data) };
}

export async function incrementDailyDiscoveryCount(
  user_id: string,
  currentCount: number,
  hasRecord: boolean
) {
  const today = new Date().toISOString().slice(0, 10);
  if (hasRecord) {
    await supabaseAdmin
      .from("daily_usage")
      .update({ discovery_count: currentCount + 1 })
      .eq("user_id", user_id)
      .eq("date", today);
    return;
  }

  await supabaseAdmin.from("daily_usage").insert({
    user_id,
    date: today,
    discovery_count: 1,
    draft_count: 0,
  });
}
