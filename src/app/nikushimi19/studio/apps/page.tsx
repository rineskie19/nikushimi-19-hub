import { ButtonLink } from "@/components/ui/Button";
import { AppTable } from "@/components/AppTable";
import { requireOwner } from "@/server/auth";
import { getApps } from "@/server/catalog";
import { studioPath } from "@/lib/studio";

export default async function StudioApps() {
  await requireOwner();
  const apps = await getApps(true);
  return <><div className="studio-head"><h1>Apps</h1><ButtonLink href={studioPath + "/apps/new"}>New app</ButtonLink></div>
    <AppTable apps={apps.map(({ slug, title, category, status, releases }) => ({ slug, title, category, status, versions: releases.length }))} /></>;
}
