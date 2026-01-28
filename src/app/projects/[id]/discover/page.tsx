import { redirect } from "next/navigation";

export default function ProjectDiscoverRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/projects/${params.id}/leads?discover=1`);
}
