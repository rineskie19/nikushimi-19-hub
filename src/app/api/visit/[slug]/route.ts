import { getApp } from "@/server/catalog";
import { getGate } from "@/server/gate";
import { isHubOrigin } from "@/server/origin";
import { recordTraffic } from "@/server/traffic";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {

  if (!isHubOrigin(request)) return new Response(null, { status: 403 });
  const { slug } = await context.params;
  if (!(await getGate()).allowed) return new Response(null, { status: 403 });
  if (slug !== "hub" && !(await getApp(slug))) return new Response(null, { status: 404 });
  await recordTraffic(slug, "", "view").catch(() => {});
  return new Response(null, { status: 204 });
}
