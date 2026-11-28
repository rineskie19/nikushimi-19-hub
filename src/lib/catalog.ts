export type HubMode = "open" | "maintenance" | "members";
export type Visibility = "draft" | "published" | "archived";
export type LinkType = "download" | "guide" | "file";

export type ReleaseFile = {
  id: string;
  label: string;
  url: string;
  description?: string;
  provider?: string;
  enabled: boolean;
};

export type SetupGuide = { url?: string; enabled: boolean };
export type ProjectVideo = { id: string; title: string; edition?: string };
export type ProjectEdition = { id: string; label: string; preview?: string; previewAlt?: string };

export type Release = {
  id: string;
  edition?: string;
  name?: string;
  requirements?: string;
  releasedOn?: string;
  updatedOn?: string;
  setup?: string;
  version: string;
  platform: string;
  sizeMb?: number;
  notes: string;
  features?: string[];
  releaseNotesUrl?: string;
  status: Visibility;
  createdAt: string;
  download?: { url: string; enabled: boolean; restricted?: boolean; label?: string };
  source?: { url: string; enabled: boolean };
  guide?: SetupGuide;
  files?: ReleaseFile[];
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  cover: string;
  icon: string;
  status: Visibility;
  featured: boolean;
  featuredAt?: string;
  shared?: { files: ReleaseFile[]; setup?: string; guide?: SetupGuide };
  showYouTube?: boolean;
  videos?: ProjectVideo[];
  editions?: ProjectEdition[];
  releases: Release[];
};

export const latestRelease = (app: Project) => app.releases.find((release) => release.status === "published");
export const lastUpdated = (app: Project) =>
  app.releases.map((release) => release.updatedOn || release.releasedOn || "").sort().at(-1) || undefined;
export const detailPath = (app: Pick<Project, "slug">) => "/apps/" + app.slug;
export const sharedDownload = { id: "shared" } as const;
export const resourcePath = (app: Pick<Project, "slug">, release: Pick<Release, "id">, type: LinkType, fileId?: string) =>
  "/go/" + app.slug + "/" + release.id + "/" + type + (fileId ? "?id=" + encodeURIComponent(fileId) : "");

const formatDay = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const displayDay = (day: string) => formatDay.format(new Date(day));
