import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

const devUser = {
  id: DEV_USER_ID,
  email: "dev@vibecode.dev",
  app_metadata: {
    plan: "PRO",
  },
};

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    if (isDev()) {
      return NextResponse.json({ user: devUser });
    }
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user: data.user });
}
