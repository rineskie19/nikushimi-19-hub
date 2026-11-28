import { CirclePlay } from "lucide-react";
import type { ProjectVideo } from "@/lib/catalog";
import { creatorLinks } from "@/lib/site";
import { embedUrl, watchUrl } from "@/lib/youtube";
import { ExternalButtonLink } from "./ui/Button";

export function ProjectVideos({ videos, headingId = "project-video-heading" }: { videos: ProjectVideo[]; headingId?: string }) {
  return <section className="project-videos" aria-labelledby={headingId}>
    <div className="project-video-heading">
      <h2 id={headingId}>YouTube</h2>
      <ExternalButtonLink variant="quiet" href={creatorLinks.youtube}><CirclePlay size={18} aria-hidden="true" /> Nikushimi19 on YouTube</ExternalButtonLink>
    </div>
    {videos.length > 0 && <div className="project-video-grid">
      {videos.map((video) => <Video key={video.id} video={video} />)}
    </div>}
  </section>;
}

function Video({ video }: { video: ProjectVideo }) {
  return <article className="panel project-video">
    <div className="video-frame">
      <iframe
        src={embedUrl(video.id)}
        title={video.title}
        loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
    <div className="project-video-copy">
      <h3>{video.title}</h3>
      <ExternalButtonLink variant="quiet" href={watchUrl(video.id)}>Watch on YouTube</ExternalButtonLink>
    </div>
  </article>;
}
