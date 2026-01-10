import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Project, Conversation } from "@/lib/types";

export async function getProjectsForUser(userId: string): Promise<Project[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getProjectsForUser", error);
    return [];
  }
  return (data as Project[]) ?? [];
}

export async function getProject(projectId: string, userId: string): Promise<Project | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getProject", error);
    return null;
  }
  return data as Project | null;
}

export async function getConversationsForProject(projectId: string): Promise<Conversation[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("project_id", projectId)
    .order("relevance_score", { ascending: false });

  if (error) {
    console.error("getConversationsForProject", error);
    return [];
  }
  return (data as Conversation[]) ?? [];
}

export async function getConversationById(id: string, projectId: string | null = null): Promise<Conversation | null> {
  const supabase = createSupabaseServerClient();
  let query = supabase.from("conversations").select("*").eq("id", id);
  if (projectId) {
    query = query.eq("project_id", projectId);
  }
  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("getConversationById", error);
    return null;
  }
  return data as Conversation | null;
}
