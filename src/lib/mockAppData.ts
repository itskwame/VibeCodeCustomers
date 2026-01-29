import { DEV_USER_ID } from "@/lib/devAuth";

export type LeadStatus = "new" | "viewed" | "saved" | "replied" | "ignored" | "responded";

export type AppProject = {
  id: string;
  userId: string;
  name: string;
  url?: string;
  building: string;
  targetCustomer: string;
  notes?: string;
  createdAt: string;
  usageThisMonth: {
    leadsFound: number;
    repliesSent: number;
    creditsUsed: number;
  };
};

export type RunRecord = {
  id: string;
  projectId: string;
  targetCustomer: string;
  building?: string;
  feedback?: string[];
  createdAt: string;
  state: "complete" | "queued";
};

export type AppLead = {
  id: string;
  projectId: string;
  projectName: string;
  platform: string;
  platformKey: string;
  platformLabel: string;
  title: string;
  post_url: string;
  context: string;
  whyQualifies: string;
  why_qualifies: string;
  suggestedReplies: [string, string];
  suggested_replies: [string, string];
  status: LeadStatus;
  run_id: string;
  dateAdded: string;
  postDate: string;
  canonicalUrl: string;
};

export type UserPlan = "free" | "starter" | "pro" | "agency";

export type AppUser = {
  id: string;
  plan: UserPlan;
  planPeriodStart: string;
  createdAt: string;
};

export type UsageCounter = {
  userId: string;
  periodKey: string;
  runsUsed: number;
  leadsAdded: number;
  updatedAt: string;
};

export type UsageSummary = {
  userId: string;
  plan: UserPlan;
  periodKey: string;
  runsUsed: number;
  leadsAdded: number;
  runsCap: number;
  leadsCap: number;
  runsRemaining: number;
  leadsRemaining: number;
  runsPercent: number;
  leadsPercent: number;
};

export type DiscoveryRun = {
  id: string;
  userId: string;
  projectId: string;
  startedAt: string;
  finishedAt: string | null;
  status: "success" | "error" | "blocked";
  errorMessage?: string | null;
  leadsFound: number;
  leadsAdded: number;
  queryMeta?: Record<string, unknown> | null;
  model?: "fast" | "premium" | null;
};

export type DiscoveryResult = {
  status: "success" | "error" | "blocked";
  runId: string;
  leadsFound: number;
  leadsAdded: number;
  limitReached: boolean;
  message?: string;
};

const PLAN_LIMITS: Record<
  UserPlan,
  {
    label: string;
    price: string;
    period: "lifetime" | "monthly";
    runsCap: number;
    leadsCap: number;
    description: string;
  }
> = {
  free: {
    label: "Free",
    price: "$0",
    period: "lifetime",
    runsCap: 3,
    leadsCap: 50,
    description: "Perfect for trying discovery before you upgrade.",
  },
  starter: {
    label: "Starter",
    price: "$29/mo",
    period: "monthly",
    runsCap: 40,
    leadsCap: 750,
    description: "Ideal for founders running weekly discovery sessions.",
  },
  pro: {
    label: "Pro",
    price: "$79/mo",
    period: "monthly",
    runsCap: 120,
    leadsCap: 2000,
    description: "Scale discovery without worrying about limits.",
  },
  agency: {
    label: "Agency",
    price: "$199/mo",
    period: "monthly",
    runsCap: 500,
    leadsCap: 10000,
    description: "Bring unlimited discovery to your whole team.",
  },
};

export const PLAN_TIERS = (Object.keys(PLAN_LIMITS) as UserPlan[]).map((planId) => {
  const config = PLAN_LIMITS[planId];
  return {
    id: planId,
    ...config,
  };
});

const PLATFORM_LABELS: Record<string, string> = {
  reddit: "Reddit",
  x: "X",
  hackernews: "Hacker News",
  indiehackers: "Indie Hackers",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  discord: "Discord",
  other: "Other",
};

const normalizePlatform = (value?: string) => {
  if (!value) {
    return { key: "other", label: PLATFORM_LABELS.other };
  }
  const normalized = value.toLowerCase();
  if (PLATFORM_LABELS[normalized]) {
    return { key: normalized, label: PLATFORM_LABELS[normalized] };
  }
  return { key: "other", label: PLATFORM_LABELS.other };
};

export const normalizeProjectUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const parseDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
let repliesSentTotal = 0;

const countBetweenDates = (start: Date, end: Date) => {
  return leads.filter((lead) => {
    const added = parseDate(lead.dateAdded);
    return added >= start && added <= end;
  }).length;
};

export const totalLeadsAllTime = () => leads.length;
export const leadsToday = () => countBetweenDates(startOfDay(new Date()), new Date());
export const leadsLast7Days = () => {
  const now = new Date();
  const last7 = new Date(now);
  last7.setDate(now.getDate() - 6);
  return countBetweenDates(startOfDay(last7), now);
};
export const leadsThisMonth = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return countBetweenDates(start, now);
};
export const leadsYTD = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return countBetweenDates(start, now);
};
export const savedLeadsCount = () => leads.filter((lead) => lead.status === "saved").length;
export const repliesSentCount = () => repliesSentTotal;

const users: AppUser[] = [
  {
    id: DEV_USER_ID,
    plan: "free",
    planPeriodStart: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const usageCounters: Record<string, UsageCounter> = {};
const discoveryRuns: DiscoveryRun[] = [];

const getPlanDefinition = (plan: UserPlan) => PLAN_LIMITS[plan];

const getPeriodKey = (plan: UserPlan) =>
  plan === "free" ? "lifetime" : new Date().toISOString().slice(0, 7);

const getUsageKey = (userId: string, periodKey: string) => `${userId}::${periodKey}`;

const resolveUser = (userId: string): AppUser => {
  let user = users.find((entry) => entry.id === userId);
  if (!user) {
    user = {
      id: userId,
      plan: "free",
      planPeriodStart: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  }
  return user;
};

const resolveUsageCounter = (userId: string, plan: UserPlan) => {
  const periodKey = getPeriodKey(plan);
  const key = getUsageKey(userId, periodKey);
  if (!usageCounters[key]) {
    usageCounters[key] = {
      userId,
      periodKey,
      runsUsed: 0,
      leadsAdded: 0,
      updatedAt: new Date().toISOString(),
    };
  }
  return usageCounters[key];
};

const logDiscoveryRun = (entry: DiscoveryRun) => {
  discoveryRuns.unshift(entry);
};

export async function getPlanForUser(userId: string): Promise<UserPlan> {
  const user = resolveUser(userId);
  return user.plan;
}

export async function getUsage(userId: string): Promise<UsageSummary> {
  const plan = await getPlanForUser(userId);
  const definition = getPlanDefinition(plan);
  const counter = resolveUsageCounter(userId, plan);
  const runsUsed = counter.runsUsed;
  const leadsAdded = counter.leadsAdded;
  const runsCap = definition.runsCap;
  const leadsCap = definition.leadsCap;
  const runsRemaining = Math.max(0, runsCap - runsUsed);
  const leadsRemaining = Math.max(0, leadsCap - leadsAdded);
  const runsPercent = runsCap > 0 ? Math.min(100, Math.round((runsUsed / runsCap) * 100)) : 0;
  const leadsPercent = leadsCap > 0 ? Math.min(100, Math.round((leadsAdded / leadsCap) * 100)) : 0;
  return {
    userId,
    plan,
    periodKey: counter.periodKey,
    runsUsed,
    leadsAdded,
    runsCap,
    leadsCap,
    runsRemaining,
    leadsRemaining,
    runsPercent,
    leadsPercent,
  };
}

export async function incrementUsage(
  userId: string,
  delta: { runsDelta?: number; leadsDelta?: number }
): Promise<UsageSummary> {
  const plan = await getPlanForUser(userId);
  const counter = resolveUsageCounter(userId, plan);
  counter.runsUsed += delta.runsDelta ?? 0;
  counter.leadsAdded += delta.leadsDelta ?? 0;
  counter.updatedAt = new Date().toISOString();
  return getUsage(userId);
}

const baseProjects: AppProject[] = [
  {
    id: "queueflow",
    userId: DEV_USER_ID,
    name: "QueueFlow Beta",
    url: "https://queueflow.app",
    building:
      "AI scheduling assistant that listens to support ops and queues meetings without sounding robotic.",
    targetCustomer: "Operations leads at fast-moving startups who juggle dozens of threads.",
    createdAt: "2026-01-12T09:00:00.000Z",
    usageThisMonth: {
      leadsFound: 24,
      repliesSent: 6,
      creditsUsed: 14,
    },
  },
  {
    id: "emberdesk",
    userId: DEV_USER_ID,
    name: "EmberDesk",
    url: "https://emberdesk.launch",
    building:
      "Customer success AI that summarizes conversations and offers empathetic replies instantly.",
    targetCustomer: "Early-stage founders running three-person CS teams.",
    createdAt: "2025-12-18T14:30:00.000Z",
    usageThisMonth: {
      leadsFound: 8,
      repliesSent: 3,
      creditsUsed: 5,
    },
  },
];

let projects: AppProject[] = [...baseProjects];

const initialRuns: Record<string, RunRecord[]> = {
  queueflow: [
    {
      id: "run-queue-2",
      projectId: "queueflow",
      targetCustomer: "Operations leads at fast-moving startups",
      building: "AI scheduling assistant for operations teams",
      feedback: ["Tone felt too formal"],
      createdAt: "2026-01-24T09:00:00.000Z",
      state: "complete",
    },
    {
      id: "run-queue-1",
      projectId: "queueflow",
      targetCustomer: "Ops teams building events",
      building: "Visible scheduling AI",
      createdAt: "2026-01-20T08:00:00.000Z",
      state: "complete",
    },
  ],
  emberdesk: [
    {
      id: "run-ember-1",
      projectId: "emberdesk",
      targetCustomer: "Founder-led CS teams",
      building: "AI that summarizes conversations into helpful replies",
      createdAt: "2026-01-15T11:30:00.000Z",
      state: "complete",
    },
  ],
};

const runHistory: Record<string, RunRecord[]> = { ...initialRuns };

const leads: AppLead[] = [
  {
    id: "lead-queueflow-1",
    projectId: "queueflow",
    userId: DEV_USER_ID,
    projectName: "QueueFlow Beta",
    source: "reddit",
    url: "https://www.reddit.com/r/indiebuilder/comments/1abc123",
    snippet: "Support teams are juggling manual standups while shipping a beta release.",
    platform: "reddit",
    platformKey: "reddit",
    platformLabel: "Reddit",
    title: "Help needed: scheduling chaos ahead of launch",
    post_url: "https://www.reddit.com/r/indiebuilder/comments/1abc123",
    canonicalUrl: "https://www.reddit.com/r/indiebuilder/comments/1abc123",
    context: "Support teams are juggling manual standups while shipping a beta release.",
    whyQualifies: "Talks about scheduling bottlenecks for operations leads.",
    why_qualifies: "Talks about scheduling bottlenecks for operations leads.",
    suggestedReplies: [
      "Built QueueFlow to keep ops teams from sounding robotic while booking syncs.",
      "Happy to show you how we queue meetings while keeping the tone warm.",
    ],
    suggested_replies: [
      "Built QueueFlow to keep ops teams from sounding robotic while booking syncs.",
      "Happy to show you how we queue meetings while keeping the tone warm.",
    ],
    status: "new",
    run_id: "run-queue-2",
    dateAdded: "2026-01-24T15:00:00.000Z",
    postDate: "2026-01-23T12:00:00.000Z",
  },
  {
    id: "lead-queueflow-2",
    projectId: "queueflow",
    userId: DEV_USER_ID,
    projectName: "QueueFlow Beta",
    source: "x",
    url: "https://x.com/ops_guru/status/1234567890",
    snippet: "Ops lead needs a calmer way to book syncs without pinging the team all day.",
    platform: "x",
    platformKey: "x",
    platformLabel: "X",
    title: "Pulling double duty booking async syncs",
    post_url: "https://x.com/ops_guru/status/1234567890",
    canonicalUrl: "https://x.com/ops_guru/status/1234567890",
    context: "Ops lead needs a calmer way to book syncs without pinging the team all day.",
    whyQualifies: "Explicitly seeking scheduling help that feels human.",
    why_qualifies: "Explicitly seeking scheduling help that feels human.",
    suggestedReplies: [
      "We keep replies friendly so they feel like they came from a teammate.",
      "Happy to share how we ship warm replies without sounding automated.",
    ],
    suggested_replies: [
      "We keep replies friendly so they feel like they came from a teammate.",
      "Happy to share how we ship warm replies without sounding automated.",
    ],
    status: "saved",
    run_id: "run-queue-1",
    dateAdded: "2026-01-25T10:30:00.000Z",
    postDate: "2026-01-24T08:45:00.000Z",
  },
  {
    id: "lead-emberdesk-1",
    projectId: "emberdesk",
    userId: DEV_USER_ID,
    projectName: "EmberDesk",
    source: "linkedin",
    url: "https://www.linkedin.com/posts/emberdesk_ai-helping",
    snippet: "CS founders want summaries that keep replies considerate and precise.",
    platform: "linkedin",
    platformKey: "linkedin",
    platformLabel: "LinkedIn",
    title: "Customer success AI that stays empathetic",
    post_url: "https://www.linkedin.com/posts/emberdesk_ai-helping",
    canonicalUrl: "https://www.linkedin.com/posts/emberdesk_ai-helping",
    context: "CS founders want summaries that keep replies considerate and precise.",
    whyQualifies: "Mentions customer success AI and human tone, matching EmberDesk.",
    why_qualifies: "Mentions customer success AI and human tone, matching EmberDesk.",
    suggestedReplies: [
      "We built EmberDesk to summarize threads so replies stay empathetic.",
      "Happy to share how we keep CS replies human and quick.",
    ],
    suggested_replies: [
      "We built EmberDesk to summarize threads so replies stay empathetic.",
      "Happy to share how we keep CS replies human and quick.",
    ],
    status: "replied",
    run_id: "run-ember-1",
    dateAdded: "2026-01-22T14:15:00.000Z",
    postDate: "2026-01-21T09:00:00.000Z",
  },
  {
    id: "lead-emberdesk-2",
    projectId: "emberdesk",
    userId: DEV_USER_ID,
    projectName: "EmberDesk",
    source: "discord",
    url: "https://discord.com/channels/abc/1234",
    snippet: "Community manager handles Discord and wants AI replies that stay helpful.",
    platform: "slack",
    platformKey: "other",
    platformLabel: "Other",
    title: "Need helpers to keep Discord support responsive",
    post_url: "https://discord.com/channels/abc/1234",
    canonicalUrl: "https://discord.com/channels/abc/1234",
    context: "Community manager handles Discord and wants AI replies that stay helpful.",
    whyQualifies: "Describes managing Discord support threads and needing fast replies.",
    why_qualifies: "Describes managing Discord support threads and needing fast replies.",
    suggestedReplies: [
      "We ship replies that keep your community feeling cared for, no robotic tone.",
      "Happy to show how EmberDesk keeps multi-channel replies consistent.",
    ],
    suggested_replies: [
      "We ship replies that keep your community feeling cared for, no robotic tone.",
      "Happy to show how EmberDesk keeps multi-channel replies consistent.",
    ],
    status: "ignored",
    run_id: "run-ember-1",
    dateAdded: "2026-01-20T16:45:00.000Z",
    postDate: "2026-01-19T12:00:00.000Z",
  },
  {
    id: "lead-emberdesk-3",
    projectId: "emberdesk",
    userId: DEV_USER_ID,
    projectName: "EmberDesk",
    source: "hackernews",
    url: "https://news.ycombinator.com/item?id=35210000",
    snippet: "Founder describes handling many customer questions and needing summaries.",
    platform: "hackernews",
    platformKey: "hackernews",
    platformLabel: "Hacker News",
    title: "Looking for CS tools that summarize burnout questions",
    post_url: "https://news.ycombinator.com/item?id=35210000",
    canonicalUrl: "https://news.ycombinator.com/item?id=35210000",
    context: "Founder describes handling many customer questions and needing summaries.",
    whyQualifies: "Talks about customer success burnout, matching EmberDesk focus.",
    why_qualifies: "Talks about customer success burnout, matching EmberDesk focus.",
    suggestedReplies: [
      "We built EmberDesk so replies stay calm even when CS is swamped.",
      "Want to see how we reply with a human tone while staying fast?",
    ],
    suggested_replies: [
      "We built EmberDesk so replies stay calm even when CS is swamped.",
      "Want to see how we reply with a human tone while staying fast?",
    ],
    status: "viewed",
    run_id: "run-ember-1",
    dateAdded: "2026-01-27T08:15:00.000Z",
    postDate: "2026-01-26T19:30:00.000Z",
  },
];

repliesSentTotal = leads.filter((lead) => lead.status === "replied").length;

const discoveryLeadTemplates = [
  {
    platform: "reddit",
    title: "Need help shipping features faster without sounding spammy",
    post_url: "https://www.reddit.com/r/indiehackers/shipping",
    context: "Founder asks about launching faster while keeping tone helpful.",
    whyQualifies: "Mentions launching quickly and value-first outreach.",
    why_qualifies: "Mentions launching quickly and value-first outreach.",
    postDate: "2026-01-26T11:00:00.000Z",
    suggestedReplies: [
      "We keep replies friendly and context-aware so they feel human. Want to preview one?",
      "Happy to share how we ship warm replies without sounding automated.",
    ],
    suggested_replies: [
      "We keep replies friendly and context-aware so they feel human. Want to preview one?",
      "Happy to share how we ship warm replies without sounding automated.",
    ],
  },
  {
    platform: "x",
    title: "Looking for AI replies that feel like a cofounder",
    post_url: "https://x.com/ops_startups/ai-hint",
    context: "Founder wants replies that stay helpful, not salesy.",
    whyQualifies: "Exactly the kind of conversation our product was built for.",
    why_qualifies: "Exactly the kind of conversation our product was built for.",
    postDate: "2026-01-25T17:20:00.000Z",
    suggestedReplies: [
      "We keep replies friendly and context-aware so they feel human. Want to preview one?",
      "Happy to share how we ship warm replies without sounding automated.",
    ],
    suggested_replies: [
      "We keep replies friendly and context-aware so they feel human. Want to preview one?",
      "Happy to share how we ship warm replies without sounding automated.",
    ],
  },
  {
    platform: "indiehackers",
    title: "Beta testers for conversational CRM helper",
    post_url: "https://www.indiehackers.com/post/conversational-crm-beta",
    context: "CS teams share burnout while juggling conversations.",
    whyQualifies: "Direct pain about managing conversations and staying helpful.",
    why_qualifies: "Direct pain about managing conversations and staying helpful.",
    postDate: "2026-01-24T09:30:00.000Z",
    suggestedReplies: [
      "Would love to invite you to test a helper that keeps conversations calm.",
      "If you need replies that sound like you, we are shaping them with early builders now.",
    ],
    suggested_replies: [
      "Would love to invite you to test a helper that keeps conversations calm.",
      "If you need replies that sound like you, we are shaping them with early builders now.",
    ],
  },
];
let leadSequence = leads.length;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const canonicalUrl = (input: string) => {
  try {
    const parsed = new URL(input);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return input.replace(/\?.*$/, "");
  }
};

export async function fetchProjects(): Promise<AppProject[]> {
  return [...projects];
}

export async function fetchProject(id: string): Promise<AppProject | undefined> {
  return projects.find((project) => project.id === id);
}

export async function createProject(payload: {
  name: string;
  url?: string;
  building?: string;
  targetCustomer?: string;
  notes?: string;
  userId?: string;
}): Promise<AppProject> {
  const normalizedUrl = normalizeProjectUrl(payload.url ?? "");
  const newProject: AppProject = {
    id: `project-${Date.now()}`,
    userId: payload.userId ?? DEV_USER_ID,
    name: payload.name,
    url: normalizedUrl,
    building: payload.building ?? "",
    targetCustomer: payload.targetCustomer ?? "",
    notes: payload.notes,
    createdAt: new Date().toISOString(),
    usageThisMonth: {
      leadsFound: 0,
      repliesSent: 0,
      creditsUsed: 0,
    },
  };
  projects = [newProject, ...projects];
  runHistory[newProject.id] = [];
  return newProject;
}

export async function updateProject(
  id: string,
  payload: {
    name: string;
    url?: string;
    building?: string;
    targetCustomer?: string;
    notes?: string;
  }
): Promise<AppProject | undefined> {
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) {
    return undefined;
  }
  const existing = projects[index];
  const normalizedUrl = normalizeProjectUrl(payload.url ?? existing.url ?? "");
  const updated: AppProject = {
    ...existing,
    userId: existing.userId,
    name: payload.name,
    url: normalizedUrl,
    building: payload.building ?? existing.building,
    targetCustomer: payload.targetCustomer ?? existing.targetCustomer,
    notes: payload.notes ?? existing.notes,
  };
  projects[index] = updated;
  return updated;
}

export async function fetchRuns(projectId: string): Promise<RunRecord[]> {
  return [...(runHistory[projectId] ?? [])];
}

export async function runDiscovery(userId: string, projectId: string): Promise<DiscoveryResult> {
  const runId = `run-${projectId}-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const usage = await getUsage(userId);
  const blockedRuns = usage.runsRemaining <= 0;
  const blockedLeads = usage.leadsRemaining <= 0;

  if (blockedRuns || blockedLeads) {
    const message = blockedRuns
      ? usage.plan === "free"
        ? "You've used your 3 free runs. Upgrade to keep finding customers."
        : "You've hit your monthly run limit. Upgrade to keep finding customers."
      : usage.plan === "free"
        ? "You've reached your 50 free leads. Upgrade to keep finding customers."
        : "You've hit your monthly lead limit. Upgrade to keep finding customers.";
    logDiscoveryRun({
      id: runId,
      userId,
      projectId,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "blocked",
      leadsFound: 0,
      leadsAdded: 0,
      errorMessage: message,
      queryMeta: null,
      model: null,
    });
    return {
      status: "blocked",
      runId,
      leadsFound: 0,
      leadsAdded: 0,
      limitReached: blockedLeads,
      message,
    };
  }

  const project = projects.find((entry) => entry.id === projectId);
  const targetCustomer = project?.targetCustomer ?? "";
  const building = project?.building;
  const runRecordBase: RunRecord = {
    id: runId,
    projectId,
    targetCustomer,
    building,
    createdAt: new Date().toISOString(),
    state: "complete",
  };

  const leadsFound = discoveryLeadTemplates.length;
  let leadsAdded = 0;
  let status: "success" | "error" = "success";
  let message: string | undefined;

  try {
    await delay(800);
    const maxLeads = Math.min(leadsFound, usage.leadsRemaining);
    const generated = generateLeadsForRun(projectId, runId, maxLeads);
    leadsAdded = generated.length;
    const limitReached = leadsAdded < leadsFound;
    if (limitReached) {
      message = "Leads capped by your plan limits.";
    }
    runHistory[projectId] = [runRecordBase, ...(runHistory[projectId] ?? [])];
  } catch (error) {
    status = "error";
    message = "Discovery failed. Please try again.";
  } finally {
    await incrementUsage(userId, { runsDelta: 1, leadsDelta: leadsAdded });
    logDiscoveryRun({
      id: runId,
      userId,
      projectId,
      startedAt,
      finishedAt: new Date().toISOString(),
      status,
      leadsFound,
      leadsAdded,
      errorMessage: status === "error" ? message ?? null : null,
      queryMeta: null,
      model: "fast",
    });
  }

  if (status === "success") {
    return {
      status: "success",
      runId,
      leadsFound,
      leadsAdded,
      limitReached: leadsAdded < leadsFound,
      message,
    };
  }

  return {
    status: "error",
    runId,
    leadsFound,
    leadsAdded,
    limitReached: false,
    message,
  };
}

export async function refineDiscovery(options: {
  projectId: string;
  targetCustomer: string;
  building?: string;
  feedback: string[];
}): Promise<RunRecord> {
  const runId = `run-${options.projectId}-${Date.now()}`;
  const record: RunRecord = {
    id: runId,
    projectId: options.projectId,
    targetCustomer: options.targetCustomer,
    building: options.building,
    feedback: options.feedback,
    createdAt: new Date().toISOString(),
    state: "queued",
  };
  runHistory[options.projectId] = [record, ...(runHistory[options.projectId] ?? [])];
  generateLeadsForRun(options.projectId, runId);
  return record;
}

const generateLeadsForRun = (projectId: string, runId: string, maxLeads?: number): AppLead[] => {
  const added: AppLead[] = [];
  const project = projects.find((entry) => entry.id === projectId);
  const projectName = project?.name ?? projectId;
  const userId = project?.userId ?? DEV_USER_ID;

  discoveryLeadTemplates.forEach((template) => {
    if (typeof maxLeads === "number" && added.length >= maxLeads) {
      return;
    }

    leadSequence += 1;
    const post_url = `${template.post_url}?run=${runId}&item=${leadSequence}`;
    const canonical = canonicalUrl(post_url);
    const alreadyExists = leads.some((lead) => canonicalUrl(lead.post_url) === canonical);
    if (alreadyExists) {
      return;
    }

    const platformMeta = normalizePlatform(template.platform);
    const snippet = template.context ?? template.title;
    const newLead: AppLead = {
      id: `lead-${leadSequence}`,
      userId,
      projectId,
      projectName,
      source: template.platform,
      url: post_url,
      snippet,
      platform: template.platform,
      platformKey: platformMeta.key,
      platformLabel: platformMeta.label,
      title: template.title,
      post_url,
      canonicalUrl: canonical,
      context: template.context,
      whyQualifies: template.whyQualifies ?? template.why_qualifies,
      why_qualifies: template.whyQualifies ?? template.why_qualifies,
      suggestedReplies: template.suggestedReplies ?? template.suggested_replies,
      suggested_replies: template.suggestedReplies ?? template.suggested_replies,
      status: "new",
      run_id: runId,
      dateAdded: new Date().toISOString(),
      postDate: template.postDate ?? "",
    };
    leads.unshift(newLead);
    added.push(newLead);
  });

  return added;
};

export async function fetchLeads(projectId: string): Promise<AppLead[]> {
  const pool = leads.filter((lead) => lead.projectId === projectId);
  const seen = new Set<string>();
  return pool.filter((lead) => {
    const canonical = canonicalUrl(lead.post_url);
    if (seen.has(canonical)) {
      return false;
    }
    seen.add(canonical);
    return true;
  });
}

export async function fetchAllLeads(): Promise<AppLead[]> {
  const seen = new Set<string>();
  return leads.filter((lead) => {
    const canonical = canonicalUrl(lead.post_url);
    if (seen.has(canonical)) {
      return false;
    }
    seen.add(canonical);
    return true;
  });
}

export async function fetchLeadById(leadId: string): Promise<AppLead | undefined> {
  return leads.find((lead) => lead.id === leadId);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<AppLead | undefined> {
  const lead = leads.find((entry) => entry.id === id);
  if (lead) {
    const previous = lead.status;
    lead.status = status;
    if (previous !== "replied" && status === "replied") {
      repliesSentTotal += 1;
    } else if (previous === "replied" && status !== "replied" && repliesSentTotal > 0) {
      repliesSentTotal -= 1;
    }
  }
  return lead;
}

export async function fetchSavedLeads(projectId?: string): Promise<AppLead[]> {
  return leads.filter((lead) => {
    const keep = lead.status === "saved" || lead.status === "replied" || lead.status === "responded";
    if (!keep) {
      return false;
    }
    if (projectId) {
      return lead.projectId === projectId;
    }
    return true;
  });
}
