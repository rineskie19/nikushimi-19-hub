import { Button } from "@/components/ui/Button";
import { ToastNotice } from "@/components/ui/ToastNotice";
import { createMember, saveMode, toggleMember } from "@/server/actions";
import { requireOwner } from "@/server/auth";
import { getMode } from "@/server/catalog";
import { database } from "@/server/database";
import { modes } from "@/lib/studio";

export default async function AccessStudio({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; notice?: string }> }) {
  await requireOwner();
  const db = await database();
  const [mode, members, query] = await Promise.all([
    getMode(),
    db.collection<{ username: string; enabled: boolean }>("accounts").find({ role: "member" }, { projection: { _id: 0, username: 1, enabled: 1 } }).sort({ username: 1 }).toArray(),
    searchParams,
  ]);
  return <>
    <h1>Access</h1>
    {query.error
      ? <ToastNotice key={query.notice ?? query.error} tone="error" message={query.error} />
      : query.saved && <ToastNotice key={query.notice ?? query.saved} tone="success" message="Member settings saved." />}
    <section className="panel studio-panel"><h2>Site access mode</h2><form action={saveMode} className="form-stack">
      {modes.map(({ value, label, description }) => <label className="mode-choice" key={value}><input type="radio" name="mode" value={value} defaultChecked={mode === value} /><span>{label}<small>{description}</small></span></label>)}
      <Button type="submit">Save access mode</Button>
    </form></section>
    <section className="panel studio-panel"><h2>Member accounts</h2>
      {members.length ? <div className="table-scroll"><table><thead><tr><th>Username</th><th>Status</th><th>Access</th></tr></thead><tbody>
        {members.map((member) => <tr key={member.username}><td>{member.username}</td><td>{member.enabled ? "Enabled" : "Disabled"}</td><td>
          <form action={toggleMember}><input type="hidden" name="username" value={member.username} /><input type="hidden" name="enabled" value={String(!member.enabled)} /><Button type="submit" variant="secondary">{member.enabled ? "Disable" : "Enable"}</Button></form>
        </td></tr>)}</tbody></table></div> : <p>No member accounts yet.</p>}
      <form className="form-stack mt-5" action={createMember}>
        <div className="form-grid"><label>Username<input name="username" required minLength={3} maxLength={40} autoComplete="off" pattern="[a-zA-Z0-9_.\-]+" /></label>
          <label>Initial password<input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /><span className="help">At least 12 characters.</span></label></div>
        <Button type="submit" variant="secondary">Create member</Button>
      </form>
    </section>
  </>;
}
