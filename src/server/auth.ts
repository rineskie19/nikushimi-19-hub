import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { database } from "./database";

export type Role = "owner" | "member";
export type Account = { username: string; hash: string; role: Role; enabled: boolean };
type Session = { tokenHash: string; username: string; expiresAt: Date };
const hashPassword = promisify(scrypt);
const cookie = "niku_session";
const oneWeek = 604800;

export async function encodePassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await hashPassword(password, salt, 64) as Buffer;
  return salt + ":" + hash.toString("hex");
}

function digest(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getSession() {
  const token = (await cookies()).get(cookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const db = await database();
  const session = await db.collection<Session>("sessions").findOne({
    tokenHash: digest(token), expiresAt: { $gt: new Date() },
  });
  if (!session) return null;
  const identity = await db.collection<Account>("accounts").findOne({ username: session.username, enabled: true });
  return identity ? { username: identity.username, role: identity.role } : null;
}

export async function requireOwner() {
  const member = await getSession();
  if (member?.role !== "owner") redirect("/access?studio=1");
  return member;
}

function loginBucket(username: string, address: string, window: number) {
  return digest(username + ":" + address + ":" + window);
}

export async function signIn(username: string, password: string) {
  const db = await database();
  const address = (await headers()).get("x-real-ip") ?? (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const attempts = db.collection<{ _id: string; count: number; expiresAt: Date }>("loginAttempts");
  const window = Math.floor(Date.now() / 600_000);
  const limit = await attempts.findOneAndUpdate(
    { _id: loginBucket("*", address, window) },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * 600_000) } },
    { upsert: true, returnDocument: "after" },
  );
  if ((limit?.count ?? 0) > 24) return false;
  const nameLimit = await attempts.findOneAndUpdate(
    { _id: loginBucket(username, "*", window) },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * 600_000) } },
    { upsert: true, returnDocument: "after" },
  );
  if ((nameLimit?.count ?? 0) > 8) return false;

  const account = await db.collection<Account>("accounts").findOne({ username, enabled: true });
  const [salt, expected] = account?.hash.split(":") ?? ["00000000000000000000000000000000", "0".repeat(128)];
  const candidate = await hashPassword(password, salt, 64) as Buffer;
  const target = Buffer.from(expected, "hex");
  if (!account || target.length !== candidate.length || !timingSafeEqual(candidate, target)) return false;

  const token = randomBytes(32).toString("hex");
  const jar = await cookies();
  const current = jar.get(cookie)?.value;
  if (current) await db.collection<Session>("sessions").deleteOne({ tokenHash: digest(current) });
  await db.collection<Session>("sessions").insertOne({
    tokenHash: digest(token), username, expiresAt: new Date(Date.now() + oneWeek * 1000),
  });
  jar.set(cookie, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: oneWeek,
    secure: process.env.VERCEL === "1" || (process.env.NODE_ENV === "production" && !process.env.APP_ORIGIN?.startsWith("http://127.0.0.1:")),
  });
  return true;
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(cookie)?.value;
  if (token) {
    const db = await database();
    await db.collection<Session>("sessions").deleteOne({ tokenHash: digest(token) });
  }
  jar.delete(cookie);
}
