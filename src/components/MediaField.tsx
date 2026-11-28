"use client";

import { useState } from "react";

export function MediaField({ name, label, initial }: { name: string; label: string; initial?: string }) {
  const [value, setValue] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    if (file.size === 0 || file.size > 5_000_000 || !/\.(png|jpe?g|webp|avif)$/i.test(file.name)) {
      setStatus("Choose a PNG, JPEG, WebP, or AVIF up to 5 MB.");
      return;
    }
    setBusy(true);
    setStatus("Uploading…");
    try {
      const signed = await fetch("/api/studio/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size: file.size }) });
      if (!signed.ok) throw new Error("signature");
      const { url, fields } = await signed.json() as { url: string; fields: Record<string, string | number> };
      const data = new FormData();
      for (const [key, field] of Object.entries(fields)) data.append(key, String(field));
      data.append("file", file);
      const response = await fetch(url, { method: "POST", body: data });
      if (!response.ok) throw new Error("upload");
      const asset = await response.json() as { secure_url?: string };
      if (!asset.secure_url?.startsWith("https://")) throw new Error("asset");
      setValue(asset.secure_url);
      setStatus("Uploaded. Save this form to attach the image.");
    } catch {
      setStatus("Upload failed. Check the image format and size, then try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="upload-block">
    <label>{label}<input name={name} value={value} onChange={(event) => setValue(event.target.value)} placeholder="https://… or /art/…" /></label>
    <label>Upload {label.toLowerCase()}<input disabled={busy} type="file" accept=".png,.jpg,.jpeg,.webp,.avif" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
    {status && <span role="status" className="help">{status}</span>}
  </div>;
}
