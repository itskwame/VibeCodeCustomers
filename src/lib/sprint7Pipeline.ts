import { chatCompletion } from "@/lib/xaiClient";
import {
  XAI_MODEL_NON_REASONING,
  XAI_MODEL_REASONING,
} from "@/lib/xai";
import {
  Candidate,
  DiscoveryRunResult,
  Lead,
  LeadDraft,
  Phase1Profile,
  SearchPlan,
} from "@/lib/sprint7Types";

const MAX_WEBSITE_TEXT = 15_000;
const CANDIDATE_BATCH_SIZE = 12;

type RunDiscoveryInput = {
  project_description: string;
  website_url?: string;
};

export async function runDiscovery(
  input: RunDiscoveryInput
): Promise<DiscoveryRunResult> {
  const run_id = `discovery-${Date.now()}`;
  const created_at = new Date().toISOString();
  const website_text = await fetchWebsiteText(input.website_url);

  const phase1 = await withTiming(
    run_id,
    "phase1-profile",
    () =>
      runPhase1Profile({
        project_description: input.project_description,
        website_url: input.website_url,
        website_text,
      })
  );

  const search_plan = await withTiming(run_id, "search-plan", () =>
    buildSearchPlan(phase1)
  );

  const candidates = await withTiming(run_id, "collect-candidates", () =>
    collectCandidates(search_plan)
  );

  const processedLeads = await withTiming(
    run_id,
    "process-candidates",
    () => processCandidatesInBatches(candidates, phase1, input.website_url)
  );

  const leads = finalizeLeads(processedLeads);

  console.log(
    `[discovery/${run_id}] done - ${leads.length} final leads across ${candidates.length} candidates`
  );

  return {
    run_id,
    created_at,
    input: {
      project_description: input.project_description,
      website_url: input.website_url,
      product_link: input.website_url,
    },
    phase1,
    search_plan,
    candidates_collected: candidates.length,
    leads_returned: leads.length,
    leads,
  };
}

async function withTiming<T>(
  runId: string,
  phase: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  console.log(`[discovery/${runId}] ${phase} started`);
  const result = await fn();
  console.log(
    `[discovery/${runId}] ${phase} finished (${Date.now() - start}ms)`
  );
  return result;
}

type Phase1Args = {
  project_description: string;
  website_url?: string;
  website_text?: string | null;
};

async function runPhase1Profile(args: Phase1Args): Promise<Phase1Profile> {
  const websiteText =
    args.website_text?.trim() || "(not provided or could not be fetched)";

  const messages = [
    {
      role: "system",
      content:
        "You are an assistant that produces strict JSON only. No markdown, no prose, no em dashes.",
    },
    {
      role: "user",
      content: `project_description: ${args.project_description.trim()}
website_url: ${args.website_url ?? "N/A"}
extracted_website_text: ${websiteText}

Output exactly one JSON object matching Phase1Profile. Provide concise, specific fields. If you inferred data without text, mark statements with (inferred).`,
    },
  ];

  const response = await chatCompletion({
    model: XAI_MODEL_REASONING,
    messages,
    max_tokens: 1200,
    temperature: 0.2,
  });

  const content = extractMessageContent(response);
  return ensureJson<Phase1Profile>(content, "Phase1Profile");
}

async function buildSearchPlan(
  phase1: Phase1Profile
): Promise<SearchPlan> {
  const messages = [
    {
      role: "system",
      content: "Return strict JSON only matching SearchPlan. No em dashes.",
    },
    {
      role: "user",
      content: `input_phase1: ${JSON.stringify(phase1)}

Create a search plan that uses customer language from the profile. Include at least 10 reddit queries and 10 x queries. Provide subreddit list, good/bad lead rules, and exclude keywords. Set max_candidates_to_collect: 200.`,
    },
  ];

  const response = await chatCompletion({
    model: XAI_MODEL_REASONING,
    messages,
    max_tokens: 800,
    temperature: 0.2,
  });

  const content = extractMessageContent(response);
  return ensureJson<SearchPlan>(content, "SearchPlan");
}

async function collectCandidates(
  searchPlan: SearchPlan
): Promise<Candidate[]> {
  const redditSeed = searchPlan.reddit_subreddits[0] ?? "r/startups";
  const redditText = searchPlan.reddit_queries.join(" / ");
  const xText = searchPlan.x_queries.join(" / ");

  const stubCandidates: Candidate[] = [
    {
      platform: "reddit",
      url: `https://www.reddit.com/${redditSeed}/comments/launching-new-product`,
      title: "We just shipped a product and need beta testers",
      text: `Looking for people who ${searchPlan.good_lead_rules[0] ?? "care about building communities"} and care about ${phasePlaceholder(
        searchPlan.good_lead_rules[0]
      )}.`,
      author: "vibe_builder",
      created_at: new Date().toISOString(),
    },
    {
      platform: "reddit",
      url: `https://www.reddit.com/${redditSeed}/comments/struggling-with-demo`,
      text: `Trying to get traction but keep hearing ${searchPlan.bad_lead_rules[0] ?? "generic replies"}. Need precision.`,
      author: "growth_hacker",
      created_at: new Date().toISOString(),
    },
    {
      platform: "x",
      url: `https://x.com/search?q=${encodeURIComponent(xText)}&src=typed_query`,
      text: `Seeing lots of folks asking about ${searchPlan.good_lead_rules[0] ?? "better research workflows"} and the responses are still too slow.`,
      author: "startup_queen",
      created_at: new Date().toISOString(),
    },
    {
      platform: "x",
      url: `https://x.com/${encodeURIComponent(searchPlan.x_queries[0] ?? "startupideas")}`,
      text: `The community says they need ${searchPlan.lead_criteria.good_lead_signals[0] ?? "clarity"} and dislike ${searchPlan.lead_criteria.bad_lead_signals[0] ?? "hype"}.`,
      author: "founder_dot",
      created_at: new Date().toISOString(),
    },
  ];

  const expanded = [
    ...stubCandidates,
    ...stubCandidates.map((candidate, index) => ({
      ...candidate,
      url: candidate.url.includes("reddit")
        ? `${candidate.url}?extra=${index}`
        : `${candidate.url}?repeat=${index}`,
    })),
  ];

  return expanded.slice(0, searchPlan.max_candidates_to_collect);
}

function phasePlaceholder(input?: string) {
  if (!input) {
    return "the exact problems they mentioned";
  }
  return input;
}

async function processCandidatesInBatches(
  candidates: Candidate[],
  phase1: Phase1Profile,
  website_url?: string
): Promise<LeadDraft[]> {
  const leads: LeadDraft[] = [];
  const productLink = website_url;

  for (const chunk of chunkArray(candidates, CANDIDATE_BATCH_SIZE)) {
    const messages = [
      {
        role: "system",
        content:
          "Return strict JSON array only. No markdown. No em dashes. Each entry must match Lead schema.",
      },
      {
        role: "user",
        content: `phase1_profile: ${JSON.stringify(phase1)}
lead_criteria: ${JSON.stringify(phase1.lead_criteria)}
product_link: ${productLink ?? "N/A"}
questions: Review the candidates below. Reject any that violate bad lead signals or contain exclude keywords. For accepted leads include why they match and two replies. reply_suggestion_1 should never include a link. reply_suggestion_2 should include a natural link if a product link is provided. Keep replies human, helpful, reddit-friendly, value-first, no sales language.
candidates: ${JSON.stringify(chunk)}
`,
      },
    ];

    const response = await chatCompletion({
      model: XAI_MODEL_REASONING,
      messages,
      max_tokens: 1500,
      temperature: 0.2,
    });

    const content = extractMessageContent(response);
    const chunkLeads = await ensureJson<LeadDraft[]>(
      content,
      "Lead[]"
    );
    leads.push(...chunkLeads);
  }

  return leads;
}

function finalizeLeads(leads: LeadDraft[]): Lead[] {
  const seen = new Set<string>();
  const normalizedLeads: LeadDraft[] = [];

  for (const lead of leads) {
    const canonical = normalizeUrl(lead.url);
    if (seen.has(canonical)) {
      continue;
    }
    seen.add(canonical);
    normalizedLeads.push(lead);
  }

  const grouped = normalizedLeads.reduce<Record<string, LeadDraft[]>>(
    (acc, lead) => {
      acc[lead.platform] = acc[lead.platform] ?? [];
      acc[lead.platform].push(lead);
      return acc;
    },
    {}
  );

  const orderedPlatforms: ("reddit" | "x")[] = ["reddit", "x"];
  const finalLeads: LeadDraft[] = [];

  orderedPlatforms.forEach((platform) => {
    const bucket = grouped[platform] ?? [];
    finalLeads.push(...bucket);
  });

  return finalLeads.map((lead, index) => ({
    ...lead,
    lead_id: index + 1,
  }));
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.search = "";
    const pathname = url.pathname.replace(/\/$/, "");
    return `${url.protocol}//${url.hostname}${pathname}`;
  } catch (error) {
    return value.toLowerCase().trim();
  }
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

type JsonSchemaName = "Phase1Profile" | "SearchPlan" | "Lead[]" | string;

async function ensureJson<T>(
  raw: string,
  schema: JsonSchemaName
): Promise<T> {
  const parsed = tryParseJson<T>(raw);
  if (parsed) {
    return parsed;
  }
  return repairJson<T>(raw, schema);
}

function tryParseJson<T>(raw: string): T | null {
  try {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

async function repairJson<T>(
  raw: string,
  schema: JsonSchemaName
): Promise<T> {
  const messages = [
    {
      role: "system",
      content:
        "You fix broken JSON only. Output strict JSON matching the schema. No markdown. No em dashes.",
    },
    {
      role: "user",
      content: `original_output: ${raw}
schema: ${schema}
Fix the JSON so it matches the schema exactly.`,
    },
  ];

  const response = await chatCompletion({
    model: XAI_MODEL_NON_REASONING,
    messages,
    max_tokens: 800,
    temperature: 0.2,
  });

  const content = extractMessageContent(response);
  const parsed = tryParseJson<T>(content);
  if (!parsed) {
    throw new Error(`Unable to repair JSON for schema ${schema}`);
  }
  return parsed;
}

function extractMessageContent(response: {
  data: any;
  text: string;
}): string {
  return (
    response.data?.choices?.[0]?.message?.content ??
    response.text ??
    ""
  );
}

async function fetchWebsiteText(
  url?: string
): Promise<string | null> {
  if (!url) {
    return null;
  }

  try {
    const normalized = new URL(url).origin;
    const endpoints = [url, `${normalized}/pricing`, `${normalized}/about`];
    const texts: string[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) continue;
        const html = await response.text();
        const extracted = extractTextFromHtml(html);
        if (!extracted) {
          continue;
        }
        texts.push(extracted);
        if (texts.join(" ").length >= MAX_WEBSITE_TEXT) {
          break;
        }
      } catch {
        // ignore individual fetch errors
      }
    }

    if (!texts.length) {
      return null;
    }

    return texts.join("\n\n").slice(0, MAX_WEBSITE_TEXT);
  } catch {
    return null;
  }
}

function extractTextFromHtml(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ");
  const withoutTags = withoutScripts
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z]+;/g, " ");
  return withoutTags.replace(/\s+/g, " ").trim();
}
