"use client";

import { useEffect } from "react";
export function Visit({ slug }: { slug: string }) {
  useEffect(() => {
    void fetch("/api/visit/" + encodeURIComponent(slug), { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
