"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { HubMode, Project, Release } from "@/lib/catalog";
import { parseYouTubeId } from "@/lib/youtube";
import { database } from "./database";
import { encodePassword, getSession, requireOwner, signIn, signOut, type Account } from "./auth";
import { getApp } from "./catalog";
import { localReturn } from "./gate";


const studio = "/nikushimi19/studio";
const v = (form: FormData, field: string) => String(form.get(field) ?? "").trim();
const checked = (form: FormData, field: string) => form.has(field);
const visibility = z.enum(["draft", "published", "archived"]);
const slugSchema = z.string().min(2).max(70).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).refine((slug) => slug !== "new" && slug !== "hub");
const httpsUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
}, "Use an HTTPS link.");
const optionalUrl = z.union([z.literal(""), httpsUrl]);
const image = z.union([z.literal(""), httpsUrl, z.string().regex(/^\/art\/[a-z0-9.-]+$/i)]);
const login = z.string().min(3).max(40).regex(/^[a-z0-9_.-]+$/);
const fileSchema = z.array(z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/i),
  label: z.string().min(1).max(100),
  url: httpsUrl,
  description: z.string().max(180),
  provider: z.string().max(50),
  enabled: z.boolean(),
})).refine((items) => new Set(items.map(({ id }) => id)).size === items.length);

function readFiles(form: FormData) {
  const labels = form.getAll("fileLabel");
  const urls = form.getAll("fileUrl");
  const descriptions = form.getAll("fileDescription");
  const providers = form.getAll("fileProvider");
  const disabled = new Set(form.getAll("disabledFile"));
  return form.getAll("fileId").map((id, index) => ({
    id: String(id),
    label: String(labels[index] ?? "").trim(),
    url: String(urls[index] ?? "").trim(),
    description: String(descriptions[index] ?? "").trim(),
    provider: String(providers[index] ?? "").trim(),
    enabled: !disabled.has(id),
  }));
}

function failure(path: string, message: string): never {
  redirect(path + (path.includes("?") ? "&" : "?") + new URLSearchParams({ error: message, notice: randomUUID() }));
}

function saved(path: string, kind: string): never {
  redirect(path + "?" + new URLSearchParams({ saved: kind, notice: randomUUID() }));
}

export async function loginAction(previous: { attempt: number; error: string }, form: FormData) {
  const attempt = previous.attempt + 1;
  const username = v(form, "username").toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = localReturn(v(form, "next"));
  const ownerScreen = checked(form, "studio");
  if (!login.safeParse(username).success || password.length < 1 || password.length > 128) {
    return { attempt, error: "Check your username and password." };
  }
  let isOwner = false;
  try {
    if (!await signIn(username, password)) {
      return { attempt, error: "Sign-in failed. Check your details or try again in a few minutes." };
    }
    isOwner = ownerScreen && (await getSession())?.role === "owner";
  } catch {
    return { attempt, error: "Sign-in is temporarily unavailable. Try again in a moment." };
  }
  redirect(isOwner ? studio : next);
}

export async function logoutAction() {
  await signOut();
  redirect("/");
}

export async function saveMode(form: FormData) {
  await requireOwner();
  const mode = z.enum(["open", "maintenance", "members"]).safeParse(v(form, "mode"));
  if (!mode.success) failure(studio, "Choose a site access mode.");
  const db = await database();
  await db.collection<{ key: string; mode: HubMode }>("settings").updateOne(
    { key: "hub" }, { $set: { mode: mode.data } }, { upsert: true },
  );
  revalidatePath("/", "layout");
  saved(studio, "access");
}

export async function createMember(form: FormData) {
  await requireOwner();
  const username = v(form, "username").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!login.safeParse(username).success || password.length < 12 || password.length > 128) {
    failure(studio + "/access", "Use a valid username and a password of at least 12 characters.");
  }
  const db = await database();
  const accounts = db.collection<Account>("accounts");
  if (await accounts.findOne({ username })) failure(studio + "/access", "This username is already in use.");
  try {
    await accounts.insertOne({ username, hash: await encodePassword(password), role: "member", enabled: true });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    failure(studio + "/access", "This username is already in use.");
  }
  saved(studio + "/access", "member");
}

export async function toggleMember(form: FormData) {
  await requireOwner();
  const username = v(form, "username");
  if (!login.safeParse(username).success) failure(studio + "/access", "Invalid member.");
  const db = await database();
  const enabled = v(form, "enabled") === "true";
  await db.collection<Account>("accounts").updateOne({ username, role: "member" }, { $set: { enabled } });
  if (!enabled) await db.collection("sessions").deleteMany({ username });
  saved(studio + "/access", "member");
}

export async function saveApp(form: FormData) {
  await requireOwner();
  const editSlug = v(form, "editSlug");
  const returnPath = editSlug && slugSchema.safeParse(editSlug).success ? studio + "/apps/" + editSlug : studio + "/apps/new";
  const row = z.object({
    slug: slugSchema, title: z.string().min(2).max(100), category: z.string().min(2).max(40),
    summary: z.string().min(2).max(180), description: z.string().max(6000),
    cover: image, icon: image, status: visibility,
    sharedFiles: fileSchema, sharedGuide: optionalUrl, sharedSetup: z.string().max(4000),
  }).safeParse({
    slug: editSlug || v(form, "slug"), title: v(form, "title"), category: v(form, "category"),
    summary: v(form, "summary"), description: v(form, "description"), cover: v(form, "cover"),
    icon: v(form, "icon"), status: v(form, "status"),
    sharedFiles: readFiles(form), sharedGuide: v(form, "sharedGuide"), sharedSetup: v(form, "sharedSetup"),
  });
  if (!row.success) failure(returnPath, "Check the app fields, slug, and image links.");
  const previous = await getApp(row.data.slug, true);
  if (editSlug ? !previous : previous) failure(returnPath, "This app or URL slug could not be saved.");
  const videoTitles = form.getAll("videoTitle");
  const videoEditions = form.getAll("videoEdition");
  const videoRows = form.getAll("videoUrl").map((url, index) => ({
    url: String(url).trim(), title: String(videoTitles[index] ?? "").trim(),
    edition: String(videoEditions[index] ?? ""),
  })).filter(({ url, title }) => url || title);
  const videos: NonNullable<Project["videos"]> = [];
  for (const { url, title, edition } of videoRows) {
    const id = parseYouTubeId(url);
    if (!id || !title || title.length > 120 || videos.some((entry) => entry.id === id)) {
      failure(returnPath, "Give each video a title and a unique YouTube video link.");
    }
    if (edition && !previous?.editions?.some((entry) => entry.id === edition)) {
      failure(returnPath, "Select a valid edition for each video.");
    }
    videos.push({ id, title, edition: edition || undefined });
  }
  const db = await database();
  const collection = db.collection<Project>("apps");
  const featured = checked(form, "featured");
  const { sharedFiles, sharedGuide, sharedSetup, ...details } = row.data;
  const shared = sharedFiles.length || sharedGuide || sharedSetup ? {
    files: sharedFiles, setup: sharedSetup || undefined,
    guide: sharedGuide || sharedSetup ? { url: sharedGuide || undefined, enabled: !checked(form, "disableSharedGuide") } : undefined,
  } : undefined;
  const fields = {
    ...details, featured, featuredAt: featured ? new Date().toISOString() : "",
    shared: form.has("filesEditor") ? shared : previous?.shared,
    showYouTube: form.has("videoEditor") ? checked(form, "showYouTube") : previous?.showYouTube,
    videos: form.has("videoEditor") ? videos : previous?.videos,
  };
  if (editSlug) {
    await collection.updateOne({ slug: row.data.slug }, {
      $set: fields,
      $setOnInsert: { releases: previous!.releases, editions: previous!.editions },
    }, { upsert: true });
  } else {
    try {
      await collection.insertOne({ ...fields, releases: [] });
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
      failure(returnPath, "This URL slug is already in use.");
    }
  }
  revalidatePath("/", "layout");
  saved(studio + "/apps/" + row.data.slug, "app");
}

export async function saveRelease(form: FormData) {
  await requireOwner();
  const slug = v(form, "slug");
  if (!slugSchema.safeParse(slug).success) failure(studio, "Invalid app.");
  const app = await getApp(slug, true);
  const path = studio + "/apps/" + slug;
  if (!app) failure(studio, "The app could not be found.");
  const releaseId = v(form, "releaseId");
  const existing = app.releases.find((release) => release.id === releaseId);
  if (releaseId && !existing) failure(path, "The release could not be found.");
  const edition = form.has("edition") ? v(form, "edition") : existing?.edition;
  if (edition && !app.editions?.some((entry) => entry.id === edition)) failure(path, "Select a valid edition.");
  const date = z.union([z.literal(""), z.iso.date()]);
  const formData = z.object({
    version: z.string().min(1).max(48), platform: z.enum(["Android", "Windows", "macOS", "Linux", "Other"]),
    sizeMb: z.union([z.literal(""), z.coerce.number().positive().max(50000)]),
    status: visibility, notes: z.string().max(6000), download: optionalUrl, downloadLabel: z.string().max(52),
    name: z.string().max(80), requirements: z.string().max(120), features: z.string().max(1000), releaseNotesUrl: optionalUrl,
    releasedOn: date, updatedOn: date, setup: z.string().max(4000), guide: optionalUrl,
    files: fileSchema,
  }).safeParse({
    version: v(form, "version"), platform: v(form, "platform"), sizeMb: v(form, "sizeMb"),
    status: v(form, "status"), notes: v(form, "notes"), download: v(form, "download"), downloadLabel: v(form, "downloadLabel"),
    name: v(form, "name"), requirements: v(form, "requirements"), features: v(form, "features"), releaseNotesUrl: v(form, "releaseNotesUrl"),
    releasedOn: v(form, "releasedOn"), updatedOn: v(form, "updatedOn"), setup: v(form, "setup"), guide: v(form, "guide"), files: readFiles(form),
  });
  if (!formData.success) failure(path, "Check the version, dates, file size, and HTTPS links.");
  const row = formData.data;
  const releaseFiles = form.has("filesEditor") ? row.files : existing?.files;

  if (row.status === "published" && !row.download && !row.guide && !row.setup && !releaseFiles?.length) {
    failure(path, "Add a resource link before publishing this version.");
  }
  const release: Release = {
    id: existing?.id ?? randomUUID(),
    edition: edition || undefined,
    version: row.version, platform: row.platform, sizeMb: row.sizeMb || undefined,
    name: row.name || undefined, requirements: row.requirements || undefined,
    features: [...new Set(row.features.split(/\r?\n/).map((feature) => feature.trim()).filter(Boolean))],
    releaseNotesUrl: row.releaseNotesUrl || undefined,
    releasedOn: row.releasedOn || undefined, updatedOn: row.updatedOn || undefined, setup: row.setup || undefined,
    files: releaseFiles,
    status: row.status, notes: row.notes,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    download: row.download ? {
      url: row.download, label: row.downloadLabel || undefined,
      enabled: !checked(form, "disableDownload"), restricted: checked(form, "restrictedDownload"),
    } : undefined,
    source: existing?.source,
    guide: row.guide || row.setup ? { url: row.guide || undefined, enabled: !checked(form, "disableGuide") } : undefined,
  };
  const db = await database();
  const apps = db.collection<Project>("apps");
  const { releases, ...appFields } = app;
  await apps.updateOne({ slug }, { $setOnInsert: { ...appFields, releases } }, { upsert: true });
  if (existing) {
    await apps.updateOne({ slug, "releases.id": existing.id }, { $set: { "releases.$": release } });
  } else {
    await apps.updateOne({ slug }, { $push: { releases: { $each: [release], $position: 0 } } });
  }
  revalidatePath("/", "layout");
  saved(path, "release");
}
