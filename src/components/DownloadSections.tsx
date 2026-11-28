import { BookOpen, ChevronDown } from "lucide-react";
import { resourcePath, type Project, type Release, type ReleaseFile, type SetupGuide } from "@/lib/catalog";
import { ExternalButtonLink } from "@/components/ui/Button";

type DownloadTarget = { app: Project; target: Pick<Release, "id"> };

export function GameFiles({ app, target, files, title, numbered }: DownloadTarget & {
  files: ReleaseFile[];
  title?: string;
  numbered?: boolean;
}) {
  if (!files.length) return null;

  return <section className="panel release-files" aria-label="Game files">
    <h3 className="release-step">{numbered && <span className="step-number">2.</span>}{title || "Game files"}</h3>
    <ul>
      {files.map((file) => <li key={file.id}>
        {file.provider && <span className="file-provider">{file.provider}</span>}
        <ExternalButtonLink variant="secondary" href={resourcePath(app, target, "file", file.id)}>{file.label}</ExternalButtonLink>
        {file.description && <p>{file.description}</p>}
      </li>)}
    </ul>
  </section>;
}

export function DownloadGuide({ app, target, guide, setup }: DownloadTarget & {
  guide?: SetupGuide;
  setup?: string;
}) {
  if (!guide?.enabled) return null;
  const steps = setup?.split(/\r?\n/).map((step) => step.trim()).filter(Boolean) ?? [];
  if (!steps.length && !guide.url) return null;

  return <div className="release-guides">
    {steps.length > 0 && <details className="setup-steps">
      <summary><BookOpen size={18} aria-hidden="true" /> Setup guide <ChevronDown size={17} className="setup-chevron" aria-hidden="true" /></summary>
      <ol>{steps.map((step, index) => <li key={index}>{step}</li>)}</ol>
    </details>}
    {guide.url && <ExternalButtonLink variant="quiet" href={resourcePath(app, target, "guide")}>
      <BookOpen size={17} aria-hidden="true" /> Original setup page
    </ExternalButtonLink>}
  </div>;
}
