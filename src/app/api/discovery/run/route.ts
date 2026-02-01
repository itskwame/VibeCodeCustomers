import { NextResponse } from "next/server";
import { runDiscovery } from "@/lib/sprint7Pipeline";
import { saveRun } from "@/lib/discoveryStore";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEV_USER_ID, isDev } from "@/lib/devAuth";

export async function POST(request: Request) {
  let projectId = "";
  const startTime = Date.now();
  try {
    const body = await request.json().catch(() => ({}));
    projectId = typeof body.projectId === "string" && body.projectId.trim() ? body.projectId.trim() : "";
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? (isDev() ? DEV_USER_ID : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, target_user, product_description")
      .eq("id", projectId)
      .eq("user_id", userId)
      .maybeSingle();

    console.log(
      `[discovery] project=${projectId} user=${userId} projectFound=${Boolean(project)}`
    );

    if (projectError) {
      console.error("[discovery] project lookup failed", projectError);
      throw projectError;
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found", projectId }, { status: 404 });
    }

    const descriptionParts = [
      project.product_description,
      project.target_user,
      project.name,
    ].filter(Boolean);
    const project_description = descriptionParts.join(" ").trim() || project.name;

    const result = await runDiscovery({
      project_description,
      website_url: undefined,
    });

    saveRun(projectId, result);
    const elapsed = Date.now() - startTime;
    console.log(
      `[discovery] project=${projectId} run=${result.run_id} leads=${result.leads_returned} elapsed=${elapsed}ms`
    );

    return NextResponse.json({
      runId: result.run_id,
      projectId,
      leads: result.leads,
      leadsReturned: result.leads_returned,
      createdAt: result.created_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error(`[discovery] project=${projectId || "unknown"} failed: ${message}`, error);
    return NextResponse.json(
      { error: "Discovery run failed", details: message },
      { status: 500 }
    );
  }
}
