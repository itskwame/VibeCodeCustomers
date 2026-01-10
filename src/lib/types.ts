export type Project = {
  id: string;
  user_id: string;
  name: string;
  product_description: string;
  keywords: string[];
  subreddits: string[];
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
};
