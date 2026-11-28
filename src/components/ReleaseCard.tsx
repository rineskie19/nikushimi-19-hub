import { ArrowDownToLine, CalendarDays, LockKeyhole, Monitor, Smartphone } from "lucide-react";
import { displayDay, resourcePath, type Project, type Release } from "@/lib/catalog";
import { DownloadGuide, GameFiles } from "./DownloadSections";
import { ExternalButtonLink } from "./ui/Button";

export function ReleaseCard({ app, release, grouped = false }: { app: Project; release: Release; grouped?: boolean }) {
  const PlatformIcon = release.platform === "Android" ? Smartphone : Monitor;
  const titleId = "release-" + release.id;
  const files = release.files?.filter((file) => file.enabled) ?? [];
  const showDownloadSteps = !grouped && release.download?.enabled && files.length > 0;
  const downloadLabel = release.download?.label || (release.platform === "Android" ? "Download APK" :
    /\.zip(?:$|\?)/i.test(release.download?.url ?? "") ? "Download ZIP" : "Download");

  return <article className="release-option" aria-labelledby={titleId}>
    <div className="panel release">
      {showDownloadSteps && <p className="release-step"><span className="step-number">1.</span> Installer</p>}
      <div className="release-top">
        <div className="release-head">
          <span className="release-icon"><PlatformIcon size={21} aria-hidden="true" /></span>
          <h3 id={titleId}>{release.name || release.version}</h3>
        </div>
        {release.releasedOn && <p className="release-date"><CalendarDays size={16} aria-hidden="true" />
          <time dateTime={release.releasedOn}>{displayDay(release.releasedOn)}</time>
        </p>}
      </div>
      {!!release.features?.length && <ul className="release-features" aria-label="Build features">
        {release.features.map((feature) => <li key={feature}>{feature}</li>)}
      </ul>}
      {(release.notes || release.releaseNotesUrl) && <p className="long-text release-notes">
        {release.notes}{release.notes && release.releaseNotesUrl && " "}
        {release.releaseNotesUrl && <a href={release.releaseNotesUrl} target="_blank" rel="noopener noreferrer">Release notes</a>}
      </p>}
      <div className="release-actions">
        {release.download?.enabled && <ExternalButtonLink className="installer-button" href={resourcePath(app, release, "download")}>
          <ArrowDownToLine size={19} aria-hidden="true" /> {downloadLabel}
        </ExternalButtonLink>}
        {!release.download?.enabled && !release.guide?.enabled && !files.length && <p className="muted">Links are temporarily unavailable.</p>}
        <div className="release-meta">
          <span>{release.requirements || release.platform}</span>
          {release.name || release.sizeMb ? <span>{[release.name ? release.version : "", release.sizeMb ? release.sizeMb + " MB" : ""].filter(Boolean).join(" · ")}</span> : null}
        </div>
        {release.download?.enabled && release.download.restricted && <p className="restriction"><LockKeyhole size={15} aria-hidden="true" /> This download requires access to the GitHub release.</p>}
      </div>
    </div>
    <GameFiles app={app} target={release} files={files} numbered={showDownloadSteps} />
    {(!grouped || !app.shared?.guide?.enabled) && <DownloadGuide app={app} target={release} guide={release.guide} setup={release.setup} />}
  </article>;
}
