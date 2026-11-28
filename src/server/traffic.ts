import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { database } from "./database";

type Kind = "view" | "download" | "source" | "guide" | "file";
type Times = { day: string; slug: string; version: string; kind: Kind; count: number };
const utcDay = () => new Date().toISOString().slice(0, 10);

export async function recordTraffic(slug: string, version: string, kind: Kind) {
  const db = await database();
  const day = utcDay();
  const connection = await headers();
  if (connection.get("purpose") === "prefetch" || connection.get("sec-purpose")?.includes("prefetch")) return;
  // Short windows coalesce refreshes and repeated taps without storing raw IPs.
  const fingerprint = [
    connection.get("x-real-ip") ?? connection.get("x-forwarded-for")?.split(",")[0] ?? "unknown",
    connection.get("user-agent") ?? "unknown",
    Math.floor(Date.now() / 30_000), slug, version, kind,
    process.env.MONGODB_URI,
  ].join("|");
  const id = createHash("sha256").update(fingerprint).digest("hex");
  const events = db.collection<{ _id: string; expiresAt: Date }>("trafficDedup");
  try {
    await events.insertOne({ _id: id, expiresAt: new Date(Date.now() + 60_000) });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return;
    throw error;
  }
  const key = [day, slug, version, kind].join("|");
  await db.collection<Times & { _id: string }>("traffic").updateOne(
    { _id: key },
    { $setOnInsert: { day, slug, version, kind }, $inc: { count: 1 } },
    { upsert: true },
  );
}

export async function getTraffic() {
  const db = await database();
  const cutoff = new Date(Date.now() - 29 * 86400_000).toISOString().slice(0, 10);
  return db.collection<Times>("traffic").find({ day: { $gte: cutoff } }, { projection: { _id: 0 } })
    .sort({ day: 1 }).toArray();
}
