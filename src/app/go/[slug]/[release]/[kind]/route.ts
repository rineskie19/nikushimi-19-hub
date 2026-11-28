import { NextResponse } from "next/server";
import { sharedDownload } from "@/lib/catalog";
import { getApp } from "@/server/catalog";
import { getGate } from "@/server/gate";
import { recordTraffic } from "@/server/traffic";

type Params = { params: Promise<{ slug: string; release: string; kind: string }> };
const uncached = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET(request: Request, context: Params) {
  const { slug, release, kind } = await context.params;
  if (kind !== "download" && kind !== "guide" && kind !== "file") return new Response(null, { status: 404, headers: uncached });
  const requestUrl = new URL(request.url);
  const fileId = kind === "file" ? requestUrl.searchParams.get("id") : null;
  if (kind === "file" && (!fileId || !/^[a-z0-9-]{1,80}$/i.test(fileId))) {
    return new Response(null, { status: 404, headers: uncached });
  }
  const gate = await getGate();
  if (!gate.allowed) {
    const path = "/go/" + slug + "/" + release + "/" + kind + (fileId ? "?id=" + encodeURIComponent(fileId) : "");
    const destination = gate.mode === "maintenance" ? "/" : "/access?next=" + encodeURIComponent(path);
    return NextResponse.redirect(new URL(destination, request.url), { headers: uncached });
  }
  const project = await getApp(slug);
  if (!project) return new Response(null, { status: 404, headers: uncached });
  const item = project.releases.find((record) => record.id === release);
  const shared = release === sharedDownload.id ? project.shared : undefined;
  const file = item?.files?.find((entry) => entry.id === fileId)
    ?? (item || shared ? project.shared?.files.find((entry) => entry.id === fileId) : undefined);
  const resource = kind === "file" ? file
    : kind === "guide" ? shared?.guide ?? item?.guide : item?.download;
  if (!resource?.enabled) return new Response("This link is unavailable.", { status: 404, headers: uncached });
  const target = resource.url;

  if (!target?.startsWith("https://")) return new Response("This link is unavailable.", { status: 404, headers: uncached });
  // Public downloads still work when the analytics write has a transient failure.
  await recordTraffic(slug, item?.version ?? sharedDownload.id, kind).catch(() => {});
  return NextResponse.redirect(target, { headers: uncached });
}

export function HEAD() {
  return new Response(null, { status: 405, headers: uncached });
}
