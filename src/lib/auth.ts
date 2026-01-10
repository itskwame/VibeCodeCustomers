import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }
  return user;
}
