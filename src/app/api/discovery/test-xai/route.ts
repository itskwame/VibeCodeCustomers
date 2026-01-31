import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/xaiClient";
import { XAI_MODEL_REASONING } from "@/lib/xai";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Only available in development" },
      { status: 403 }
    );
  }

  try {
    const response = await chatCompletion({
      model: XAI_MODEL_REASONING,
      messages: [
        {
          role: "system",
          content:
            "Reply with the literal string OK only. No markdown, no JSON, no extra text.",
        },
        {
          role: "user",
          content: "Please respond with OK only.",
        },
      ],
      max_tokens: 5,
      temperature: 0,
    });

    const content =
      response.data?.choices?.[0]?.message?.content ??
      response.text ??
      "OK";

    return NextResponse.json({ ok: true, content });
  } catch (error) {
    console.error("Discovery test xAI failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
