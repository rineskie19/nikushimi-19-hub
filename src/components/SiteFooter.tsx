import Link from "next/link";
import { CirclePlay, HeartHandshake, Info } from "lucide-react";
import { creatorLinks } from "@/lib/site";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="shell">
      <div className="footer-brand">
        <Link href="/" className="wordmark"><img className="brand-mark" src="/mark.svg" width={30} height={30} alt="" /><span>Nikushimi19</span></Link>
        <p>App downloads and setup guides</p>
      </div>
      <nav className="footer-links" aria-label="Footer">
        <Link className="footer-link" href="/about"><Info size={17} aria-hidden="true" /> About</Link>
        <a className="footer-link" href={creatorLinks.youtube} target="_blank" rel="noreferrer"><CirclePlay size={17} className="youtube-icon" aria-hidden="true" /> YouTube</a>
        <a className="footer-link" href={creatorLinks.support} target="_blank" rel="noreferrer"><HeartHandshake size={17} aria-hidden="true" /> Support</a>
      </nav>
    </div>
  </footer>;
}
