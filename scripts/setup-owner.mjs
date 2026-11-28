import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
const credentialPath = ".local/owner-login.txt";
let credentialCreated = false;
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "nikushimi_hub");
  await Promise.all([
    db.collection("accounts").createIndex({ username: 1 }, { unique: true }),
    db.collection("accounts").createIndex({ role: 1 }, { unique: true, partialFilterExpression: { role: "owner" } }),
    db.collection("apps").createIndex({ slug: 1 }, { unique: true }),
    db.collection("settings").createIndex({ key: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("loginAttempts").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("traffic").createIndex({ day: 1 }),
    db.collection("trafficDedup").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
  const accounts = db.collection("accounts");
  if (await accounts.findOne({ role: "owner" })) {
    console.log("The owner account is already set up.");
  } else {
    const username = "nikushimi19";
    const password = randomBytes(24).toString("base64url");
    const salt = randomBytes(16).toString("hex");
    const hash = (await promisify(scrypt)(password, salt, 64)).toString("hex");
    await mkdir(".local", { recursive: true });
    await writeFile(credentialPath, username + "\n" + password + "\n", { flag: "wx", mode: 0o600 });
    credentialCreated = true;
    await accounts.insertOne({ username, hash: salt + ":" + hash, role: "owner", enabled: true });
    console.log("Owner created. Open the ignored .local/owner-login.txt file locally.");
  }
} catch {
  if (credentialCreated) await unlink(credentialPath).catch(() => {});
  console.error("Owner setup could not complete. Check the database connection and the local credential file.");
  process.exitCode = 1;
} finally {
  await client.close();
}
