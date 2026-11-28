import { Button } from "@/components/ui/Button";
import { Catalog } from "@/components/Catalog";
import { GateNotice } from "@/components/GateNotice";
import { Visit } from "@/components/Visit";
import { lastUpdated, latestRelease } from "@/lib/catalog";
import { getApps } from "@/server/catalog";
import { getGate } from "@/server/gate";
import { getSession } from "@/server/auth";
import { logoutAction } from "@/server/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const gate = await getGate();
  if (!gate.allowed) return <GateNotice mode={gate.mode} />;
  const apps = (await getApps()).map((app) => {
    const release = latestRelease(app);
    const platforms = [...new Set(app.releases.map(({ platform }) => platform))];
    const versions = new Set(app.releases.map(({ version }) => version));
    const { slug, title, category, icon, summary, featured } = app;
    return { slug, title, category, icon, summary, featured, updated: lastUpdated(app), platform: platforms.join(" / "), version: versions.size === 1 ? release?.version : undefined };
  });
  const session = gate.mode === "members" ? await getSession() : null;
  return <main><Visit slug="hub" /><Catalog apps={apps} />{session && <form className="shell signout-bottom" action={logoutAction}><Button type="submit" variant="secondary">Sign out</Button></form>}</main>;
}
