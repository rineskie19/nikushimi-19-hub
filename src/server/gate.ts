import { getSession } from "./auth";
import { getMode } from "./catalog";

export async function getGate() {
  const mode = await getMode();
  if (mode === "open") return { mode, allowed: true };
  const member = await getSession();
  return { mode, allowed: member?.role === "owner" || (mode === "members" && !!member) };
}

export function localReturn(value?: string | null) {
  const candidate = value && /^\/(?!\/)[a-z0-9/_?&=.+-]*$/i.test(value) ? value : "/";
  return candidate.length <= 220 ? candidate : "/";
}
