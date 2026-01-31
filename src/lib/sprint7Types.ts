export type Phase1Profile = {
  product_name: string;
  product_summary_plain: string;
  product_not: string[];
  ideal_customer: {
    who: string;
    cares_about: string[];
    behaviors: string[];
  };
  pain_points: string[];
  language_customers_use: string[];
  platforms: {
    reddit: { subreddits: string[] };
    x: { search_angles: string[] };
  };
  lead_criteria: {
    good_lead_signals: string[];
    bad_lead_signals: string[];
    exclude_keywords: string[];
  };
};

export type SearchPlan = {
  reddit_queries: string[];
  reddit_subreddits: string[];
  x_queries: string[];
  x_filters: string[];
  good_lead_rules: string[];
  bad_lead_rules: string[];
  exclude_keywords: string[];
  max_candidates_to_collect: number;
};

export type Candidate = {
  platform: "reddit" | "x";
  url: string;
  title?: string;
  text: string;
  author?: string;
  created_at?: string;
  meta?: Record<string, any>;
};

export type Lead = {
  lead_id: number;
  platform: "reddit" | "x";
  url: string;
  why_match: string;
  reply_suggestion_1: string;
  reply_suggestion_2: string;
};

export type LeadDraft = Omit<Lead, "lead_id">;

export type DiscoveryRunResult = {
  run_id: string;
  created_at: string;
  input: {
    project_description: string;
    website_url?: string;
    product_link?: string;
  };
  phase1: Phase1Profile;
  search_plan: SearchPlan;
  candidates_collected: number;
  leads_returned: number;
  leads: Lead[];
};
