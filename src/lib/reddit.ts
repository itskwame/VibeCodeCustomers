export type RedditSearchResult = {
  externalId: string;
  url: string;
  title: string;
  author: string;
  subreddit: string;
  createdAt: string;
  score: number;
  numComments: number;
  excerpt: string;
  relevanceScore: number;
};

const USER_AGENT = "VibeCodeCustomers/0.1 (discovery prototype)";

export async function searchReddit({
  keywords,
  subreddits,
  timeRange = "month",
}: {
  keywords: string[];
  subreddits: string[];
  timeRange?: "day" | "week" | "month" | "year" | "all";
}): Promise<RedditSearchResult[]> {
  const results: RedditSearchResult[] = [];
  const unique = new Set<string>();

  for (const subreddit of subreddits) {
    for (const keyword of keywords) {
      const url = new URL(`https://www.reddit.com/r/${subreddit}/search.json`);
      url.searchParams.set("q", keyword);
      url.searchParams.set("restrict_sr", "1");
      url.searchParams.set("sort", "new");
      url.searchParams.set("t", timeRange);

      const response = await fetch(url.toString(), {
        headers: { "User-Agent": USER_AGENT },
        cache: "no-store",
      });

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as {
        data?: { children?: Array<{ data?: Record<string, unknown> }> };
      };

      const children = payload.data?.children ?? [];

      for (const child of children) {
        const data = child.data ?? {};
        const externalId = String(data["id"] ?? "");
        const title = String(data["title"] ?? "");
        const selftext = String(data["selftext"] ?? "");
        const excerpt = selftext.slice(0, 240);
        const combined = `${title} ${excerpt}`.toLowerCase();
        const relevanceScore = scoreRelevance(combined, keywords);

        if (!externalId || unique.has(externalId)) {
          continue;
        }

        unique.add(externalId);
        results.push({
          externalId,
          url: String(data["url"] ?? ""),
          title,
          author: String(data["author"] ?? "unknown"),
          subreddit: String(data["subreddit"] ?? subreddit),
          createdAt: new Date(Number(data["created_utc"] ?? 0) * 1000).toISOString(),
          score: Number(data["score"] ?? 0),
          numComments: Number(data["num_comments"] ?? 0),
          excerpt,
          relevanceScore,
        });
      }
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function scoreRelevance(text: string, keywords: string[]) {
  let score = 0;
  for (const keyword of keywords) {
    const normalized = keyword.toLowerCase().trim();
    if (!normalized) {
      continue;
    }
    if (text.includes(normalized)) {
      score += 18;
    }
  }
  return Math.min(100, score);
}
