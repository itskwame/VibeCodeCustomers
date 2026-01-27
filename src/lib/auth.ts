import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

export async function getUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    return data.user;
  }
  if (isDev()) {
    return {
      id: DEV_USER_ID,
      email: "dev@vibecode.dev",
      app_metadata: {
        plan: "PRO",
      },
    };
  }
  return null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }
  return user;
}
