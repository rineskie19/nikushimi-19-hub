import { randomUUID } from "node:crypto";
import { getSession } from "@/server/auth";
import { isHubOrigin } from "@/server/origin";
import { cloudSettings } from "@/server/media";

export async function POST(request: Request) {
  if (!isHubOrigin(request) || (await getSession())?.role !== "owner") {
    return new Response(null, { status: 403 });
  }
  const payload = await request.json().catch(() => null) as { size?: number } | null;
  const size = payload?.size;
  if (typeof size !== "number" || !Number.isInteger(size) || size < 1 || size > 5_000_000) {
    return Response.json({ error: "Choose an image up to 5 MB." }, { status: 400 });
  }
  const { cloudinary, name, key, secret } = cloudSettings();
  const params = {
    timestamp: Math.floor(Date.now() / 1000),
    public_id: "nikushimi19/art/" + randomUUID(),
    overwrite: "false",
    allowed_formats: "png,jpg,jpeg,webp,avif",
  };
  return Response.json({
    url: "https://api.cloudinary.com/v1_1/" + encodeURIComponent(name) + "/image/upload",
    fields: { ...params, api_key: key, signature: cloudinary.utils.api_sign_request(params, secret) },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
