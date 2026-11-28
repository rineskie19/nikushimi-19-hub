"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesColumn, KeyRound, Library } from "lucide-react";
import { studioPath } from "@/lib/studio";

const nav = [
  { path: studioPath, label: "Overview", Icon: ChartNoAxesColumn },
  { path: studioPath + "/apps", label: "Apps", Icon: Library },
  { path: studioPath + "/access", label: "Access", Icon: KeyRound },
];

export function StudioNav() {
  const current = usePathname();
  return <>{nav.map(({ path, label, Icon }) => {
    const active = current === path || path !== studioPath && current.startsWith(path + "/");
    return <Link key={path} href={path} aria-current={active ? "page" : undefined}><Icon size={17} /> {label}</Link>;
  })}</>;
}
