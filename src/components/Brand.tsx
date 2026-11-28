import Link from "next/link";
import { PackageOpen } from "lucide-react";
import type { Theme } from "@/lib/site";
import { ThemeSwitch } from "./ThemeSwitch";

export function Brand({ theme }: { theme: Theme }) {
  return <header className="site-header"><div className="shell header-line">
    <Link href="/" className="wordmark"><img className="brand-mark" src="/mark.svg" width={38} height={38} alt="" /><span>Nikushimi19</span></Link>
    <nav className="header-tools" aria-label="Main navigation">
      <Link href="/" className="header-link" aria-label="Downloads"><PackageOpen size={17} aria-hidden="true" /><span>Downloads</span></Link>
      <ThemeSwitch initialTheme={theme} />
    </nav>
  </div></header>;
}
