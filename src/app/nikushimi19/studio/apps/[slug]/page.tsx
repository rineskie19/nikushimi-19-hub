import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ToastNotice } from "@/components/ui/ToastNotice";
import { notFound } from "next/navigation";
import { MediaField } from "@/components/MediaField";
import { ProjectVideosEditor } from "@/components/ProjectVideosEditor";
import { ReleaseFilesEditor } from "@/components/ReleaseFilesEditor";
import type { Project, ProjectEdition, Release, Visibility } from "@/lib/catalog";
import { studioPath } from "@/lib/studio";
import { saveApp, saveRelease } from "@/server/actions";
import { requireOwner } from "@/server/auth";
import { getApp } from "@/server/catalog";

function Status({ value = "draft" }: { value?: Visibility }) {
  return <label>Visibility<select name="status" defaultValue={value}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>;
}

function AppForm({ app }: { app?: Project }) {
  return <form action={saveApp} className="form-stack">
    {app && <input type="hidden" name="editSlug" value={app.slug} />}
    <div className="form-grid">
      <label>App name<input name="title" defaultValue={app?.title} required minLength={2} maxLength={100} /></label>
      <label>Public URL slug<input name="slug" defaultValue={app?.slug} readOnly={!!app} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={70} placeholder="my-new-app" /></label>
      <label>Category<input name="category" defaultValue={app?.category} required minLength={2} maxLength={40} /></label><Status value={app?.status} />
    </div>
    <label>Short description<input name="summary" defaultValue={app?.summary} required minLength={2} maxLength={180} /></label>
    <label>About this app<textarea name="description" defaultValue={app?.description} rows={4} maxLength={6000} /></label>
    <div className="form-grid"><MediaField name="icon" label="Icon" initial={app?.icon} /><MediaField name="cover" label="Cover image" initial={app?.cover} /></div>
    <label className="check"><input type="checkbox" name="featured" defaultChecked={app?.featured} /> Feature on the home page</label>
    <span className="help">The most recently featured published app appears first in the catalog.</span>
    <details className="studio-form-section">
      <summary>Shared game files and setup</summary>
      <div className="form-stack">
        <ReleaseFilesEditor initialFiles={app?.shared?.files} />
        <label>Shared setup steps<textarea name="sharedSetup" rows={4} maxLength={4000} defaultValue={app?.shared?.setup} /><span className="help">One step per line, shown below the build cards.</span></label>
        <label>Original setup page URL<input name="sharedGuide" type="url" placeholder="https://…" defaultValue={app?.shared?.guide?.url} /></label>
        <label className="check"><input type="checkbox" name="disableSharedGuide" defaultChecked={app?.shared?.guide?.enabled === false} /> Disable shared setup guide</label>
      </div>
    </details>
    <details className="studio-form-section">
      <summary>YouTube</summary>
      <div className="form-stack">
        <label className="check"><input name="showYouTube" type="checkbox" defaultChecked={app?.showYouTube} /> Show the channel link even with no videos</label>
        <ProjectVideosEditor initialVideos={app?.videos} editions={app?.editions} />
      </div>
    </details>
    <Button type="submit">{app ? "Save app" : "Create app"}</Button>
  </form>;
}

function ReleaseForm({ slug, release, editions = [] }: { slug: string; release?: Release; editions?: ProjectEdition[] }) {
  return <form action={saveRelease} className="form-stack">
    <input type="hidden" name="slug" value={slug} />
    {release && <input type="hidden" name="releaseId" value={release.id} />}
    <div className="form-grid">
      {editions.length > 0 && <label>Edition tab<select name="edition" defaultValue={release?.edition ?? ""}>
        <option value="">Outside the tabs</option>
        {editions.map((edition) => <option key={edition.id} value={edition.id}>{edition.label}</option>)}
      </select></label>}
      <label>Edition name<input name="name" maxLength={80} defaultValue={release?.name} placeholder="Android · 64-bit" /></label>
      <label>Release date<input name="releasedOn" type="date" defaultValue={release?.releasedOn} /></label>
      <label>Last updated<input name="updatedOn" type="date" defaultValue={release?.updatedOn} /><span className="help">Defaults to the release date.</span></label>
      <label>Version<input name="version" required maxLength={48} defaultValue={release?.version} placeholder="v1.0" /></label>
      <label>Platform<select name="platform" defaultValue={release?.platform ?? "Android"}>{["Android", "Windows", "macOS", "Linux", "Other"].map((platform) => <option key={platform}>{platform}</option>)}</select></label>
      <label>Size in MB<input name="sizeMb" type="number" min="0.01" step="0.01" max="50000" defaultValue={release?.sizeMb} /></label>
      <Status value={release?.status} />
    </div>
    <label>Compatibility<input name="requirements" maxLength={120} defaultValue={release?.requirements} /></label>
    <label>Build features<textarea name="features" rows={3} maxLength={1000} defaultValue={release?.features?.join("\n")} /><span className="help">Enter one highlight per line.</span></label>
    <label>Release notes<textarea name="notes" rows={3} maxLength={6000} defaultValue={release?.notes} /></label>
    <label>Release notes URL<input name="releaseNotesUrl" type="url" placeholder="https://…" defaultValue={release?.releaseNotesUrl} /></label>
    <label>Download button label<input name="downloadLabel" defaultValue={release?.download?.label} maxLength={52} placeholder="Download APK" /></label>
    <label>External download URL<input name="download" type="url" defaultValue={release?.download?.url} placeholder="https://…" /></label>
    <span className="help">Paste a release-asset URL from your APK host. The hub controls when this link is available here.</span>
    <label className="check"><input type="checkbox" name="disableDownload" defaultChecked={release?.download?.enabled === false} /> Disable download link</label>
    <label className="check"><input type="checkbox" name="restrictedDownload" defaultChecked={release?.download?.restricted} /> External download requires GitHub access</label>
    <ReleaseFilesEditor initialFiles={release?.files} />
    <label>Setup steps<textarea name="setup" rows={4} maxLength={4000} defaultValue={release?.setup} /><span className="help">Enter one step per line.</span></label>
    <label>Setup guide URL<input name="guide" type="url" placeholder="https://…" defaultValue={release?.guide?.url} /></label>
    <label className="check"><input type="checkbox" name="disableGuide" defaultChecked={release?.guide?.enabled === false} /> Disable setup guide</label>
    <Button type="submit">{release ? "Save release" : "Add release"}</Button>
  </form>;
}

export default async function AppEditor({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string; error?: string; notice?: string }> }) {
  await requireOwner();
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const app = slug === "new" ? undefined : await getApp(slug, true);
  if (slug !== "new" && !app) notFound();
  return <>
    <Link className="back-link" href={studioPath + "/apps"}><ArrowLeft size={16} /> Apps</Link>
    <h1>{app?.title ?? "New app"}</h1>
    {query.error
      ? <ToastNotice key={query.notice ?? query.error} tone="error" message={query.error} />
      : query.saved && <ToastNotice key={query.notice ?? query.saved} tone="success" message={query.saved === "release" ? "Release saved." : "App saved."} />}
    <section className="panel studio-panel"><h2>App details</h2><AppForm app={app} /></section>
    {app && <><h2>Releases</h2>
      {app.releases.map((release) => <details className="panel studio-panel release-edit" key={release.id}><summary>{release.name ? release.name + " · " : ""}{release.version} · {release.platform} · {release.status}</summary><ReleaseForm slug={app.slug} release={release} editions={app.editions} /></details>)}
      <details className="panel studio-panel release-edit" open={!app.releases.length}><summary>Add a release</summary><ReleaseForm slug={app.slug} editions={app.editions} /></details>
    </>}
  </>;
}
