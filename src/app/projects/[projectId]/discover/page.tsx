import { redirect } from "next/navigation";

export default function ProjectDiscoverRedirect({
  params,
}: {
  params: { projectId: string };
}) {
  redirect(`/projects/${params.projectId}/leads?discover=1`);
}
