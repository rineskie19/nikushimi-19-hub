import type { HubMode, Project } from "@/lib/catalog";
import { database } from "./database";
import { initialApps } from "./seed";

type Settings = { key: "hub"; mode: HubMode };

export async function getMode(): Promise<HubMode> {
  const db = await database();
  return (await db.collection<Settings>("settings").findOne({ key: "hub" }))?.mode ?? "open";
}

export async function getApps(includeDrafts = false): Promise<Project[]> {
  const db = await database();
  const stored = await db.collection<Project>("apps").find({}, { projection: { _id: 0 } }).toArray();
  // Seed entries are defaults. A saved record, including an archived one, replaces its default.
  const bySlug = new Map(initialApps.map((app) => [app.slug, app]));
  for (const app of stored) bySlug.set(app.slug, app);
  const apps = [...bySlug.values()];
  if (includeDrafts) return apps;
  const published = apps.filter((app) => app.status === "published");
  const featured = published.filter((app) => app.featured)
    .sort((first, second) => (second.featuredAt ?? "").localeCompare(first.featuredAt ?? ""))[0];
  return published.map((app) => ({
    // The last saved featured selection takes precedence over older selections.
    ...app,
    featured: app.slug === featured?.slug,
    releases: app.releases.filter((release) => release.status === "published")
      .map(({ source: _privateSource, ...release }) => release),
  }));
}

export async function getApp(slug: string, includeDrafts = false) {
  return (await getApps(includeDrafts)).find((app) => app.slug === slug);
}
