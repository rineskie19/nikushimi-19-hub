import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { localReturn } from "@/server/gate";
import { SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function Access({ searchParams }: { searchParams: Promise<{ next?: string; studio?: string }> }) {
  const query = await searchParams;
  const studio = query.studio === "1";
  return <main className="shell empty-page"><section className="panel notice access-panel">
    <KeyRound size={26} className="accent" /><h1>{studio ? "Studio sign in" : "Sign in"}</h1>
    {!studio && <p>Use the account provided by the hub owner.</p>}
    <SignInForm next={localReturn(query.next)} studio={studio} />
    <Link className="back-link" href="/"><ArrowLeft size={16} /> Downloads</Link>
  </section></main>;
}
