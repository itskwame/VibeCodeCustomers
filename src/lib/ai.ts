import { optionalEnv } from "@/lib/env";

type ConversationContext = {
  title: string;
  excerpt: string;
  subreddit: string;
  productDescription: string;
};

type AnalysisResult = {
  summary: string;
  painPoints: string[];
  whyMatched: string;
};

type DraftOptions = {
  tone: "helpful" | "casual" | "professional";
  length: "short" | "medium" | "long";
};

export async function generateAnalysis(context: ConversationContext): Promise<AnalysisResult> {
  const apiKey = optionalEnv("OPENAI_API_KEY");
  if (apiKey) {
    try {
      const result = await callOpenAi({
        prompt: `Summarize the conversation and extract pain points. Conversation: ${context.title} - ${context.excerpt}`,
      });
      return {
        summary: result,
        painPoints: inferPainPoints(context),
        whyMatched: `Mentions topics related to ${context.productDescription}.`,
      };
    } catch {
      // Fall through to heuristic mode.
    }
  }

  const painPoints = inferPainPoints(context);
  return {
    summary: `${context.title}. The author is looking for help or guidance related to: ${painPoints.join(
      ", "
    )}.`,
    painPoints,
    whyMatched: `The post aligns with your product focus on ${context.productDescription}.`,
  };
}

export async function generateDraft(
  context: ConversationContext,
  options: DraftOptions
): Promise<string> {
  const apiKey = optionalEnv("OPENAI_API_KEY");
  if (apiKey) {
    try {
      return await callOpenAi({
        prompt: `Write a ${options.length} ${options.tone} reply. Conversation: ${context.title} - ${context.excerpt}. Product: ${context.productDescription}. No salesy language.`,
      });
    } catch {
      // Fall through to heuristic mode.
    }
  }

  const toneLead =
    options.tone === "casual"
      ? "Hey! "
      : options.tone === "professional"
      ? "Thanks for sharing. "
      : "Thanks for posting this. ";

  const lengthTail =
    options.length === "long"
      ? "If it helps, I can share a checklist or walk through what has worked for other builders."
      : options.length === "medium"
      ? "If you want, I can share a quick checklist that keeps things honest and helpful."
      : "Happy to share a quick checklist if useful.";

  return `${toneLead}Sounds like you're exploring ${context.title.toLowerCase()}. One thing that helps is to focus on a small, specific outcome and ask a simple follow-up question.${lengthTail} What kind of outcome are you aiming for?`;
}

async function callOpenAi({ prompt }: { prompt: string }) {
  const apiKey = optionalEnv("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed");
  }

  const data = (await response.json()) as {
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const text = data.output?.[0]?.content?.[0]?.text;
  if (!text) {
    throw new Error("Empty AI response");
  }
  return text.trim();
}

function inferPainPoints(context: ConversationContext) {
  const base = context.excerpt.toLowerCase();
  const points = [];
  if (base.includes("pricing") || base.includes("cost")) {
    points.push("pricing clarity");
  }
  if (base.includes("traction") || base.includes("users")) {
    points.push("early traction");
  }
  if (base.includes("validation") || base.includes("idea")) {
    points.push("idea validation");
  }
  if (points.length === 0) {
    points.push("getting unstuck on next steps");
  }
  return points;
}
