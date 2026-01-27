import { createHash } from "crypto";
import { requireEnv } from "@/lib/env";
import type { Project, LeadResult } from "@/lib/types";

export type LeadSite = "reddit" | "hackernews" | "indiehackers" | "github";
export type LeadSearchTimeWindow = "7" | "30";

export const DEFAULT_LEAD_SITES: LeadSite[] = ["reddit", "hackernews", "indiehackers", "github"];

const SITE_DOMAINS: Record<LeadSite, string> = {
  reddit: "reddit.com",
  hackernews: "news.ycombinator.com",
  indiehackers: "indiehackers.com",
  github: "github.com",
};

const INTENT_QUERY_PHRASES = ["looking for", "need help", "alternatives", "recommend", "struggling", "how do I"];
const INTENT_PHRASES = [
  "looking for",
  "any tool",
  "any app",
  "recommend",
  "alternatives",
  "does anyone know",
  "need help",
  "struggling",
  "how do I",
  "is there a way",
  "can't",
  "no users",
  "no customers",
  "first customers",
  "first users",
  "get leads",
  "made money",
];
const ARTICLE_HINTS = ["how i built", "guide", "tutorial", "case study", "newsletter", "mrr"];
const THREAD_PATTERNS = [
  /reddit\.com\/r\/[^\/]+\/comments\//i,
  /news\.ycombinator\.com\/item\?id=/i,
  /github\.com\/[^\/]+\/[^\/]+\/issues\//i,
];
const MIN_KEYWORDS = 3;
const MAX_KEYWORDS = 8;

type NormalizedHit = {
  url: string;
  title: string;
  snippet: string;
  publishedAt?: string;
  engine: "google" | "bing";
};

type LeadSearchOptions = {
  keywords: string[];
  sites: LeadSite[];
  timeWindow: LeadSearchTimeWindow;
  limit: number;
  excludeArticles: boolean;
};

type CacheKeyInput = {
  userId: string;
  projectId: string;
  sites: LeadSite[];
  timeWindow: LeadSearchTimeWindow;
  limit: number;
  excludeArticles: boolean;
  keywords: string[];
};

export class SerpApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "SerpApiError";
  }
}

function getSerpApiKey() {
  return requireEnv("SERPAPI_API_KEY");
}

export function resolveLeadKeywords(project: Project): string[] {
  const normalizedFromProject = project.keywords
    ?.map(normalizeKeyword)
    .filter((value) => value.length > 1) ?? [];

  const uniqueProvided = Array.from(new Set(normalizedFromProject));
  if (uniqueProvided.length >= MIN_KEYWORDS) {
    return uniqueProvided.slice(0, MAX_KEYWORDS);
  }

  const derived = Array.from(
    new Set(
      extractKeywords(`${project.name} ${project.product_description ?? ""}`).filter((value) => value.length >= 2)
    )
  );
  const merged = Array.from(new Set([...uniqueProvided, ...derived])).slice(0, MAX_KEYWORDS);
  if (merged.length >= MIN_KEYWORDS) {
    return merged;
  }

  const fallbackTokens = Array.from(
    new Set([
      ...extractKeywords(project.name),
      ...extractKeywords(project.product_description ?? ""),
      "customers",
      "leads",
      "ai",
    ])
  );
  const padded = fallbackTokens.slice(0, MAX_KEYWORDS);
  const extra = ["vibe", "support", "build", "growth"];
  for (const term of extra) {
    if (padded.length >= MAX_KEYWORDS) {
      break;
    }
    if (!padded.includes(term)) {
      padded.push(term);
    }
  }
  const fallbackSeeds = ["growth", "building", "service", "beta", "feedback"];
  let paddingIndex = 0;
  while (padded.length < MIN_KEYWORDS) {
    const candidate = `${fallbackSeeds[paddingIndex % fallbackSeeds.length]}${
      paddingIndex >= fallbackSeeds.length ? `-${paddingIndex}` : ""
    }`;
    if (!padded.includes(candidate)) {
      padded.push(candidate);
    }
    paddingIndex += 1;
  }
  return padded.slice(0, MAX_KEYWORDS);
}

function normalizeKeyword(value: string) {
  return value
    .toLowerCase()
    .replace(/["']/g, "")
    .trim();
}

function extractKeywords(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

export function buildLeadQuery(keywords: string[], sites: LeadSite[]) {
  const cleanedKeywords = keywords.map((keyword) => `"${keyword.replace(/"/g, "")}"`);
  const keywordClause = cleanedKeywords.length ? `(${cleanedKeywords.join(" OR ")})` : "";
  const intentClause = `(${INTENT_QUERY_PHRASES.map((phrase) => `"${phrase}"`).join(" OR ")})`;
  const siteClause = `(${sites.map((site) => `site:${SITE_DOMAINS[site]}`).join(" OR ")})`;
  return [keywordClause, intentClause, siteClause].filter(Boolean).join(" ").trim();
}

export function computeLeadCacheKey(input: CacheKeyInput) {
  const key = {
    userId: input.userId,
    projectId: input.projectId,
    sites: [...input.sites].sort(),
    timeWindow: input.timeWindow,
    limit: input.limit,
    excludeArticles: input.excludeArticles,
    keywords: [...input.keywords].sort(),
  };
  return createHash("sha256").update(JSON.stringify(key)).digest("hex");
}

export async function searchLeads(options: LeadSearchOptions): Promise<{ results: LeadResult[]; query: string }> {
  const { keywords, sites, timeWindow, limit, excludeArticles } = options;
  const query = buildLeadQuery(keywords, sites);
  const enginePromises = ["google", "bing"].map((engine) =>
    fetchEngineResults(engine as NormalizedHit["engine"], query, timeWindow)
  );
  const allHits = (await Promise.all(enginePromises)).flat();
  const deduped = dedupeLeads(allHits, keywords, excludeArticles);
  const sorted = deduped.sort((a, b) => b.score - a.score);
  return { results: sorted.slice(0, limit), query };
}

async function fetchEngineResults(engine: NormalizedHit["engine"], query: string, timeWindow: LeadSearchTimeWindow) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", engine);
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", getSerpApiKey());
  url.searchParams.set("num", "20");
  if (engine === "google") {
    url.searchParams.set("tbs", timeWindow === "7" ? "qdr:w" : "qdr:m");
  } else {
    url.searchParams.set("freshness", timeWindow === "7" ? "Day" : "Month");
  }

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new SerpApiError(body ?? "SerpAPI request failed", response.status);
  }

  const payload = await response.json().catch(() => ({}));
  return extractNormalizedHits(payload, engine);
}

function extractNormalizedHits(payload: unknown, engine: NormalizedHit["engine"]) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const sources = [
    ...(Array.isArray((payload as Record<string, unknown>).organic_results) ? ((payload as Record<string, unknown>).organic_results as unknown[]) : []),
    ...(Array.isArray((payload as Record<string, unknown>).news_results) ? ((payload as Record<string, unknown>).news_results as unknown[]) : []),
    ...(Array.isArray((payload as Record<string, unknown>).top_stories) ? ((payload as Record<string, unknown>).top_stories as unknown[]) : []),
  ];

  const normalized: NormalizedHit[] = [];

  for (const entry of sources) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const url = String(record.link ?? record.url ?? record.first_url ?? "").trim();
    const title = String(record.title ?? record.heading ?? record.name ?? "").trim();
    const snippet = String(record.snippet ?? record.description ?? record.body ?? "").trim();
    const publishedAt = String(record.date ?? record.published ?? record.time ?? "").trim();

    if (!url || !title) {
      continue;
    }

    normalized.push({
      url,
      title,
      snippet,
      publishedAt: publishedAt || undefined,
      engine,
    });
  }

  return normalized;
}

function dedupeLeads(hits: NormalizedHit[], keywords: string[], excludeArticles: boolean) {
  const seen = new Map<string, LeadResult>();
  for (const hit of hits) {
    const normalizedUrl = hit.url.split("#")[0].split("?")[0];
    if (seen.has(normalizedUrl)) {
      continue;
    }
    const lead = normalizeToLead(hit, keywords, excludeArticles);
    seen.set(normalizedUrl, lead);
  }
  return Array.from(seen.values());
}

function normalizeToLead(hit: NormalizedHit, keywords: string[], excludeArticles: boolean): LeadResult {
  const title = hit.title;
  const snippet = hit.snippet;
  const titleLower = title.toLowerCase();
  const snippetLower = snippet.toLowerCase();
  const body = `${titleLower} ${snippetLower}`;

  const matchedKeywords = Array.from(
    new Set(
      keywords.filter((keyword) => {
        const normalized = keyword.toLowerCase();
        return normalized && body.includes(normalized);
      })
    )
  );

  const intentInTitle = INTENT_PHRASES.some((phrase) => titleLower.includes(phrase));
  const intentInSnippet = INTENT_PHRASES.some((phrase) => snippetLower.includes(phrase));
  const threadLike = THREAD_PATTERNS.some((pattern) => pattern.test(hit.url));
  const lowerUrl = hit.url.toLowerCase();
  const looksLikeArticle =
    lowerUrl.includes("/blog/") ||
    ARTICLE_HINTS.some((hint) => titleLower.includes(hint) || snippetLower.includes(hint));

  let score = 0;
  if (intentInTitle) score += 30;
  if (intentInSnippet) score += 15;
  if (matchedKeywords.length >= 2) score += 20;
  if (threadLike) score += 15;
  if (excludeArticles && looksLikeArticle) score -= 40;
  score = Math.max(0, Math.min(100, score));

  const engine = hit.engine;
  const id = createHash("sha1").update(`${engine}:${hit.url}`).digest("hex");

  return {
    id,
    title,
    snippet,
    url: hit.url,
    source: detectSource(hit.url),
    score,
    engine,
    publishedAt: hit.publishedAt,
    keywordsMatched: matchedKeywords,
    threadLike,
    isArticle: looksLikeArticle,
  };
}

function detectSource(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes("reddit.com")) return "Reddit";
  if (lower.includes("news.ycombinator.com")) return "Hacker News";
  if (lower.includes("indiehackers.com")) return "Indie Hackers";
  if (lower.includes("github.com")) return "GitHub";
  return "Web";
}
