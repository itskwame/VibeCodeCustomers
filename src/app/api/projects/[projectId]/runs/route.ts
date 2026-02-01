import { NextResponse, type NextRequest } from "next/server";
import { getRunHistory } from "@/lib/discoveryStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const history = getRunHistory(projectId);
  return NextResponse.json({
    projectId,
    runs: history.map((entry) => ({
      run_id: entry.run_id,
      created_at: entry.created_at,
      leads_returned: entry.leads_returned,
    })),
  });
}
