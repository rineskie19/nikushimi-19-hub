import { ButtonLink } from "@/components/ui/Button";
import { ToastNotice } from "@/components/ui/ToastNotice";
import { modes, studioPath } from "@/lib/studio";
import { requireOwner } from "@/server/auth";
import { getApps, getMode } from "@/server/catalog";
import { getTraffic } from "@/server/traffic";

const metrics = [
  ["view", "Page views"], ["download", "Download requests"], ["guide", "Guide clicks"], ["file", "Game file clicks"],
] as const;

export default async function Studio({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; notice?: string }> }) {
  await requireOwner();
  const [apps, traffic, mode, query] = await Promise.all([getApps(true), getTraffic(), getMode(), searchParams]);
  const counts = metrics.map(([kind]) => traffic.filter((row) => row.kind === kind).reduce((sum, row) => sum + row.count, 0));
  const days = Array.from({ length: 30 }, (_, i) => new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10));
  const daily = new Map(days.map((day) => [day, 0]));
  for (const row of traffic) daily.set(row.day, (daily.get(row.day) ?? 0) + row.count);
  const peak = Math.max(1, ...daily.values());
  return <>
    <div className="studio-head"><div><h1>Overview</h1><p>Activity over the last 30 days</p></div><ButtonLink href={studioPath + "/apps/new"}>New app</ButtonLink></div>
    {query.error
      ? <ToastNotice key={query.notice ?? query.error} tone="error" message={query.error} />
      : query.saved === "access" && <ToastNotice key={query.notice} tone="success" message="Site access updated." />}
    <div className="metric-grid">{metrics.map(([kind, label], i) => <div className="panel metric" key={kind}><strong>{counts[i].toLocaleString()}</strong><span>{label}</span></div>)}</div>
    <section className="panel studio-panel"><div className="studio-head"><h2>Site access</h2><span className="pill">{modes.find((item) => item.value === mode)?.label}</span></div><p className="mt-3">{modes.find((item) => item.value === mode)?.description}</p><ButtonLink variant="secondary" className="mt-4" href={studioPath + "/access"}>Manage access</ButtonLink></section>
    <section className="panel studio-panel"><h2>Daily activity</h2><div className="traffic-chart" role="img" aria-label="Daily activity over the last 30 days">
      {days.map((day) => <span key={day} title={day + " · " + daily.get(day)} style={{ height: Math.max(2, (daily.get(day) ?? 0) / peak * 100) + "%" }} />)}
    </div><p className="help">{days[0]} to {days.at(-1)} UTC</p></section>
    <section className="panel studio-panel"><h2>Activity by app</h2><div className="table-scroll"><table><thead><tr><th>App</th>{metrics.map(([kind, label]) => <th key={kind}>{label}</th>)}</tr></thead><tbody>
      {[...apps.map(({ slug, title }) => ({ slug, title })), { slug: "hub", title: "Hub home" }].map(({ slug, title }) => <tr key={slug}><td>{title}</td>{metrics.map(([kind]) => <td key={kind}>{traffic.filter((row) => row.slug === slug && row.kind === kind).reduce((sum, row) => sum + row.count, 0)}</td>)}</tr>)}
    </tbody></table></div></section>
  </>;
}
