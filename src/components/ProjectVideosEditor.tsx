"use client";

import { useState } from "react";
import type { ProjectEdition, ProjectVideo } from "@/lib/catalog";
import { watchUrl } from "@/lib/youtube";
import { Button } from "./ui/Button";

export function ProjectVideosEditor({ initialVideos = [], editions = [] }: { initialVideos?: ProjectVideo[]; editions?: ProjectEdition[] }) {
  const [entries, setEntries] = useState(() => initialVideos.map((video) => ({
    key: video.id, title: video.title, url: watchUrl(video.id), edition: video.edition ?? "",
  })));

  return <fieldset className="studio-file-editor">
    <legend>YouTube videos</legend>
    <input name="videoEditor" type="hidden" value="1" />
    {entries.map((entry) => <div key={entry.key} className="studio-file-row form-stack">
      <div className="form-grid">
        <label>Video title<input name="videoTitle" defaultValue={entry.title} maxLength={120} /></label>
        <label>YouTube video URL<input name="videoUrl" type="url" defaultValue={entry.url} placeholder="https://youtu.be/…" /></label>
        {editions.length > 0 && <label>Video edition<select name="videoEdition" defaultValue={entry.edition}>
          <option value="">All editions</option>
          {editions.map((edition) => <option key={edition.id} value={edition.id}>{edition.label}</option>)}
        </select></label>}
      </div>
      <Button variant="quiet" onClick={() => setEntries((current) => current.filter(({ key }) => key !== entry.key))}>Remove video</Button>
    </div>)}
    <Button variant="secondary" onClick={() => setEntries((current) => [...current, { key: crypto.randomUUID(), title: "", url: "", edition: "" }])}>Add YouTube video</Button>
  </fieldset>;
}
