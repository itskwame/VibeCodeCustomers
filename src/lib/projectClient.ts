import { Project } from "@/lib/types";

export type UsageTotals = {
  leadsFound: number;
  repliesSent: number;
  creditsUsed: number;
};

export type ProjectView = {
  id: string;
  name: string;
  building: string;
  targetCustomer: string;
  createdAt: string;
  updatedAt: string;
  url?: string;
  usageThisMonth: UsageTotals;
  raw: Project;
};

const initialUsage: UsageTotals = {
  leadsFound: 0,
  repliesSent: 0,
  creditsUsed: 0,
};

const normalizeProject = (project: Project): ProjectView => ({
  id: project.id,
  name: project.name,
  building: project.product_description ?? "",
  targetCustomer: project.target_user ?? "",
  createdAt: project.created_at,
  updatedAt: project.updated_at,
  usageThisMonth: { ...initialUsage },
  url: undefined,
  raw: project,
});

async function parseErrorResponse(response: Response): Promise<string | null> {
  try {
    const body = await response.json();
    return typeof body?.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}

export async function fetchProjectList(): Promise<ProjectView[]> {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    const message = (await parseErrorResponse(response)) ?? "Unable to fetch projects.";
    throw new Error(message);
  }
  const payload = (await response.json()) as Project[];
  return payload.map((project) => normalizeProject(project));
}

export async function fetchProjectById(projectId: string): Promise<ProjectView | null> {
  const response = await fetch(`/api/projects/${projectId}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const message = (await parseErrorResponse(response)) ?? "Unable to fetch project.";
    throw new Error(message);
  }
  const { project } = (await response.json()) as { project?: Project };
  if (!project) {
    return null;
  }
  return normalizeProject(project);
}
