import { Button } from "@/components/ui/Button";
import { StudioNav } from "@/components/StudioNav";
import { requireOwner } from "@/server/auth";
import { logoutAction } from "@/server/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Studio", robots: { index: false, follow: false } };

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  await requireOwner();
  return <main className="shell studio"><aside aria-label="Studio navigation">
    <strong>Owner studio</strong><StudioNav />
    <form action={logoutAction}><Button type="submit" variant="secondary">Sign out</Button></form>
  </aside><div className="studio-main">{children}</div></main>;
}
