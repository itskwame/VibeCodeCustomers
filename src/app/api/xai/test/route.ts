import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/xaiClient";
import { XAI_MODEL_REASONING } from "@/lib/xai";

export async function GET() {
  try {
    const response = await chatCompletion({
      model: XAI_MODEL_REASONING,
      messages: [
        {
          role: "system",
          content: "Reply with the literal string OK only. No markdown or extras.",
        },
        { role: "user", content: "OK" },
      ],
      max_tokens: 5,
      temperature: 0,
    });

    const content =
      response.data?.choices?.[0]?.message?.content ??
      response.text ??
      "OK";

    return NextResponse.json({
      ok: true,
      model: response.data?.model ?? "unknown",
      content,
      usage: response.data?.usage ?? null,
    });
  } catch (error) {
    console.error("xAI test failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
