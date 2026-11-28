"use client";

import { useState } from "react";
import type { ReleaseFile } from "@/lib/catalog";
import { Button } from "./ui/Button";

export function ReleaseFilesEditor({ initialFiles = [] }: { initialFiles?: ReleaseFile[] }) {
  const [files, setFiles] = useState(initialFiles);

  function addFile() {
    setFiles((current) => [...current, { id: crypto.randomUUID(), label: "", url: "", enabled: true }]);
  }

  return <fieldset className="studio-file-editor">
    <legend>Game files and maps</legend>
    <input type="hidden" name="filesEditor" value="1" />
    {files.map((file) => <div key={file.id} className="studio-file-row form-stack">
      <input type="hidden" name="fileId" value={file.id} />
      <div className="form-grid">
        <label>Link label<input name="fileLabel" defaultValue={file.label} required maxLength={100} placeholder="Open game file" /></label>
        <label>File or provider URL<input name="fileUrl" type="url" defaultValue={file.url} required placeholder="https://…" /></label>
      </div>
      <div className="form-grid">
        <label>File details<input name="fileDescription" defaultValue={file.description} maxLength={180} placeholder="USA · ZIP archive" /></label>
        <label>Provider name<input name="fileProvider" defaultValue={file.provider} maxLength={50} placeholder="Romsfun" /></label>
      </div>
      <div className="button-row">
        <label className="check"><input type="checkbox" name="disabledFile" value={file.id} defaultChecked={!file.enabled} /> Disable link</label>
        <Button variant="quiet" onClick={() => setFiles((current) => current.filter(({ id }) => id !== file.id))}>Remove link</Button>
      </div>
    </div>)}
    <Button variant="secondary" onClick={addFile}>Add file link</Button>
  </fieldset>;
}
