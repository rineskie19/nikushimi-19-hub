import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { DownloadGuide, GameFiles } from "@/components/DownloadSections";
import { EditionTabs } from "@/components/EditionTabs";
import { GateNotice } from "@/components/GateNotice";
import { ProjectVideos } from "@/components/ProjectVideos";
import { ReleaseCard } from "@/components/ReleaseCard";
import { Visit } from "@/components/Visit";
import { displayDay, lastUpdated, sharedDownload, type Project, type Release } from "@/lib/catalog";
import { getApp } from "@/server/catalog";
import { getGate } from "@/server/gate";

export const dynamic = "force-dynamic";

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gate = await getGate();
  if (!gate.allowed) return <GateNotice mode={gate.mode} next={"/apps/" + slug} />;
  const app = await getApp(slug);
  if (!app) notFound();
  const updated = lastUpdated(app);
  const shared = app.shared;
  const sharedFiles = shared?.files.filter((file) => file.enabled) ?? [];
  const numbered = sharedFiles.length > 0 && app.releases.some((release) => release.download?.enabled);
  const editions = app.editions?.map((edition) => ({
    ...edition,
    releases: app.releases.filter((release) => release.edition === edition.id),
    videos: (app.videos ?? []).filter((video) => video.edition === edition.id),
  })).filter((edition) => edition.releases.length > 0) ?? [];
  const hasEditions = editions.length > 0;
  const assigned = new Set(app.editions?.map(({ id }) => id));
  const commonReleases = app.releases.filter((release) => !release.edition || !assigned.has(release.edition));
  const commonVideos = (app.videos ?? []).filter((video) => !video.edition || !assigned.has(video.edition));

  return <main className="shell detail"><Visit slug={app.slug} />
    <Link className="back-link" href="/"><ArrowLeft size={17} aria-hidden="true" /> All downloads</Link>
    <header className="detail-header">
      {app.icon && <img className="app-icon" src={app.icon} alt="" />}
      <div className="detail-heading">
        <h1>{app.title}</h1><p>{app.description || app.summary}</p>
        {updated && <p className="app-update"><CalendarDays size={16} aria-hidden="true" /> Last updated <time dateTime={updated}>{displayDay(updated)}</time></p>}
      </div>
    </header>
    {hasEditions ? <>
      <EditionTabs tabs={editions.map((edition) => ({
        id: edition.id,
        label: edition.label,
        content: <>
          <ReleaseList app={app} releases={edition.releases} heading={edition.label + " downloads"} headingId={edition.id + "-downloads"} />
          {edition.preview && <GameplayPreview src={edition.preview} alt={edition.previewAlt || edition.label + " gameplay"}
            heading={edition.label + " gameplay"} headingId={edition.id + "-preview"} />}
          {edition.videos.length > 0 && <ProjectVideos videos={edition.videos} headingId={edition.id + "-videos"} />}
        </>,
      }))} />
      {commonReleases.length > 0 && <ReleaseList app={app} releases={commonReleases} heading="Other builds" />}
    </> : <ReleaseList app={app} releases={app.releases} numbered={numbered}
      heading={shared ? "Choose your app" : app.releases.length > 1 ? "Choose a build" : "Downloads"} />}
    {sharedFiles.length > 0 && <section className="shared-files" aria-labelledby="shared-files-heading">
      <h2 id="shared-files-heading" className="download-heading">{numbered && <span className="step-number">2.</span>} Get the game file</h2>
      <GameFiles app={app} target={sharedDownload} files={sharedFiles} title={app.title} />
    </section>}
    {shared && <div className="shared-setup"><DownloadGuide app={app} target={sharedDownload} guide={shared.guide} setup={shared.setup} /></div>}
    {!hasEditions && app.cover && app.cover !== app.icon && <GameplayPreview src={app.cover} alt={app.title + " gameplay"} />}
    {hasEditions
      ? commonVideos.length > 0 && <ProjectVideos videos={commonVideos} />
      : (app.showYouTube || !!app.videos?.length) && <ProjectVideos videos={app.videos ?? []} />}
  </main>;
}

function ReleaseList({ app, releases, heading, headingId = "release-heading", numbered }: {
  app: Project;
  releases: Release[];
  heading: string;
  headingId?: string;
  numbered?: boolean;
}) {
  return <section className="detail-content" aria-labelledby={headingId}>
    <h2 id={headingId} className="download-heading">{numbered && <span className="step-number">1.</span>}{heading}</h2>
    {releases.length ? <div className="release-grid" data-grouped={!!app.shared}>
      {releases.map((release) => <ReleaseCard key={release.id} app={app} release={release} grouped={!!app.shared} />)}
    </div> : <p>No published releases yet.</p>}
  </section>;
}

function GameplayPreview({ src, alt, heading = "Gameplay preview", headingId = "preview-heading" }: {
  src: string;
  alt: string;
  heading?: string;
  headingId?: string;
}) {
  return <section className="detail-preview" aria-labelledby={headingId}>
    <h2 id={headingId}>{heading}</h2>
    <img src={src} alt={alt} loading="lazy" />
  </section>;
}
