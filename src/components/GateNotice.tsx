import { ButtonLink } from "@/components/ui/Button";
import { LockKeyhole, Wrench } from "lucide-react";

export function GateNotice({ mode, next = "/" }: { mode: string; next?: string }) {
  const maintenance = mode === "maintenance";
  const Icon = maintenance ? Wrench : LockKeyhole;
  return <main className="shell empty-page"><div className="notice panel">
    <Icon className="accent" size={30} />
    <h1>{maintenance ? "Back after maintenance" : "Sign in to access downloads"}</h1>
    <p>{maintenance ? "The download hub is temporarily closed while updates are underway." : "Rowell Mode is active. Use the account provided by the hub owner."}</p>
    {!maintenance && <ButtonLink href={"/access?next=" + encodeURIComponent(next)}>Sign in</ButtonLink>}
  </div></main>;
}
