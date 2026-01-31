import { requireXaiKey, XAI_BASE_URL } from "@/lib/xai";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionOptions = {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
};

type ChatCompletionResult = {
  data: any;
  text: string;
};

export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const key = requireXaiKey();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  const baseUrl = XAI_BASE_URL.replace(/\/$/, "");
  const endpoint = `${baseUrl}/chat/completions`;

  const payload: Record<string, any> = {
    model: options.model,
    messages: options.messages,
  };
  if (typeof options.max_tokens === "number") {
    payload.max_tokens = options.max_tokens;
  }
  if (typeof options.temperature === "number") {
    payload.temperature = options.temperature;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(
        `xAI request failed (${response.status}): ${text?.slice(0, 500)}`
      );
    }
    const data = JSON.parse(text);
    return { data, text };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("xAI request timed out (60s).");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
