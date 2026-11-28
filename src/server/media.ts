import { v2 as cloudinary } from "cloudinary";

export function cloudSettings() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!name || !key || !secret) throw new Error("Media storage is not configured.");
  return { cloudinary, name, key, secret };
}
