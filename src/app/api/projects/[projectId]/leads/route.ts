import { NextResponse, type NextRequest } from "next/server";
import { getLatestRun } from "@/lib/discoveryStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const latest = getLatestRun(projectId);
  return NextResponse.json({
    projectId,
    leads: latest?.leads ?? [],
    leads_returned: latest?.leads_returned ?? 0,
    run_id: latest?.run_id ?? null,
    created_at: latest?.created_at ?? null,
  });
}
