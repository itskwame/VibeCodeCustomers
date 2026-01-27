export type Project = {
  id: string;
  user_id: string;
  name: string;
  product_description: string;
  keywords: string[];
  subreddits: string[];
  target_user?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  project_id: string;
  platform: string;
  external_id: string;
  url: string;
  title: string;
  author: string;
  subreddit: string;
  created_at: string;
  score: number;
  num_comments: number;
  excerpt: string;
  relevance_score: number;
  ai_summary: string | null;
  ai_pain_points: string[] | null;
  ai_why_matched: string | null;
  last_analyzed_at: string | null;
  source?: string | null;
  found_at?: string | null;
};

export type SessionUser = {
  id: string;
  email?: string;
  app_metadata?: {
    plan?: "FREE" | "PRO";
  };
};

export type LeadResult = {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
  score: number;
  engine: "google" | "bing";
  publishedAt?: string;
  keywordsMatched: string[];
  threadLike: boolean;
  isArticle: boolean;
};
