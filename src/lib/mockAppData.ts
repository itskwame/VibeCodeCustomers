export type LeadStatus = "new" | "saved" | "replied" | "ignored" | "responded";

export type AppProject = {
  id: string;
  name: string;
  url?: string;
  building: string;
  targetCustomer: string;
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
  platform: "reddit" | "x";
  title: string;
  post_url: string;
  context: string;
  why_qualifies: string;
  suggested_replies: [string, string];
  status: LeadStatus;
  run_id: string;
};

const baseProjects: AppProject[] = [
  {
    id: "queueflow",
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

const discoveryCounts: Record<string, number> = {
  queueflow: initialRuns.queueflow.length,
  emberdesk: initialRuns.emberdesk.length,
};

let runHistory: Record<string, RunRecord[]> = { ...initialRuns };

let leads: AppLead[] = [
  {
    id: "lead-queueflow-1",
    projectId: "queueflow",
    platform: "reddit",
    title: "Help needed: team scheduling chaos ahead of launch",
    post_url: "https://www.reddit.com/r/indiebuilder/comments/1abc123",
    context: "We are shipping a beta next week and our ops folks are manually juggling support standups, which is draining.",
    why_qualifies: "Mentioned scheduling bottlenecks for growth teams, which QueueFlow solves.",
    suggested_replies: [
      "Hey! I built QueueFlow to remove calendar ping-pong for operations leaders. Want to shape the tone by giving feedback?",
      "Love how you care about how the team actually feels when scheduling standups. Would you try a friendly AI scheduler soon?",
    ],
    status: "new",
    run_id: "run-queue-2",
  },
  {
    id: "lead-queueflow-2",
    projectId: "queueflow",
    platform: "x",
    title: "Need AI that schedules like a human without cold messages",
    post_url: "https://x.com/ops_guru/status/1234567890",
    context: "Responsible for ops at a lean team and need a better way to book syncs while keeping the tone warm.",
    why_qualifies: "Directly asks for scheduling help with human tone, matching QueueFlow.",
    suggested_replies: [
      "Built something to keep ops from sounding like calendar robots. Happy to give you early access to shape replies.",
      "I hear you—scheduling should feel like helping, not pitching. Want to test QueueFlow for 1:1 prep?",
    ],
    status: "saved",
    run_id: "run-queue-1",
  },
  {
    id: "lead-emberdesk-1",
    projectId: "emberdesk",
    platform: "reddit",
    title: "Beta testers wanted for CS AI assistant",
    post_url: "https://www.reddit.com/r/startups/comments/xyz987",
    context: "Managing incoming leads solo and need quick way to summarize threads and respond.",
    why_qualifies: "CS automation, exactly what EmberDesk delivers.",
    suggested_replies: [
      "EmberDesk summarizes threads and suggests warm replies in seconds. Mind if we invite you to the beta?",
      "If you want summaries that sound like you, EmberDesk is shaping replies with founders right now. Interested?",
    ],
    status: "responded",
    run_id: "run-ember-1",
  },
  {
    id: "lead-emberdesk-2",
    projectId: "emberdesk",
    platform: "x",
    title: "Need help taking better care of customers",
    post_url: "https://x.com/founderbrie/status/abcdef",
    context: "It is just me handling customer questions and want AI help that stays natural.",
    why_qualifies: "Matches EmberDesk target for founder-led CS teams.",
    suggested_replies: [
      "Would love to send you EmberDesk to keep replies human without the 2-hour drafts. Want to test it?",
      "We built a helper that writes replies while keeping Founder tone. Want an invite to try it?",
    ],
    status: "replied",
    run_id: "run-ember-1",
  },
];

const runLimit = 3;

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
  building: string;
  targetCustomer: string;
}): Promise<AppProject> {
  const newProject: AppProject = {
    id: `project-${Date.now()}`,
    name: payload.name,
    url: payload.url,
    building: payload.building,
    targetCustomer: payload.targetCustomer,
    createdAt: new Date().toISOString(),
    usageThisMonth: {
      leadsFound: 0,
      repliesSent: 0,
      creditsUsed: 0,
    },
  };
  projects = [newProject, ...projects];
  runHistory[newProject.id] = [];
  discoveryCounts[newProject.id] = 0;
  return newProject;
}

export async function fetchRuns(projectId: string): Promise<RunRecord[]> {
  return [...(runHistory[projectId] ?? [])];
}

export async function runDiscovery(
  projectId: string
): Promise<{ limitReached: boolean; runId?: string; message?: string }> {
  const count = (discoveryCounts[projectId] ?? 0) + 1;
  discoveryCounts[projectId] = count;

  if (count > runLimit) {
    return {
      limitReached: true,
      message:
        "You've hit the mock limit for this demo. Upgrade to unlock more discovery credits instantly.",
    };
  }

  const runId = `run-${projectId}-${Date.now()}`;
  const record: RunRecord = {
    id: runId,
    projectId,
    targetCustomer: (projects.find((project) => project.id === projectId)?.targetCustomer) ?? "",
    building: projects.find((project) => project.id === projectId)?.building,
    createdAt: new Date().toISOString(),
    state: "complete",
  };
  runHistory[projectId] = [record, ...(runHistory[projectId] ?? [])];
  await delay(800);
  return {
    limitReached: false,
    runId,
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
  discoveryCounts[options.projectId] = 0;
  return record;
}

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

export async function fetchLeadById(leadId: string): Promise<AppLead | undefined> {
  return leads.find((lead) => lead.id === leadId);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<AppLead | undefined> {
  const lead = leads.find((entry) => entry.id === id);
  if (lead) {
    lead.status = status;
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
