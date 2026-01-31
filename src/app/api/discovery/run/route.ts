import { NextResponse } from "next/server";
import { runDiscovery } from "@/lib/sprint7Pipeline";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const project_description =
      typeof body.project_description === "string"
        ? body.project_description.trim()
        : "";
    if (!project_description) {
      return NextResponse.json(
        { error: "project_description is required" },
        { status: 400 }
      );
    }

    const website_url =
      typeof body.website_url === "string" && body.website_url.trim()
        ? body.website_url.trim()
        : undefined;

    const result = await runDiscovery({
      project_description,
      website_url,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Discovery run failed", error);
    return NextResponse.json(
      {
        error: "Discovery run failed",
        details:
          error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 }
    );
  }
}
