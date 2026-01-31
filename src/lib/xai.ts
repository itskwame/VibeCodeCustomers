export const XAI_BASE_URL = process.env.XAI_BASE_URL ?? "https://api.x.ai/v1";
export const XAI_MODEL_REASONING =
  process.env.XAI_MODEL_REASONING ?? "grok-4-1-fast-reasoning";
export const XAI_MODEL_NON_REASONING =
  process.env.XAI_MODEL_NON_REASONING ?? "grok-4-1-fast-non-reasoning";
export const XAI_MODEL =
  process.env.XAI_MODEL ?? XAI_MODEL_REASONING;

export function requireXaiKey(): string {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error("Missing XAI_API_KEY (server env var not set).");
  return key;
}

