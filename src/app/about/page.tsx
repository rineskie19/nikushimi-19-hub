import { CirclePlay, Gamepad2, HeartHandshake, Library } from "lucide-react";
import { GateNotice } from "@/components/GateNotice";
import { ButtonLink, buttonClassName } from "@/components/ui/Button";
import { creatorLinks } from "@/lib/site";
import { getGate } from "@/server/gate";

export const metadata = { title: "About" };

export default async function About() {
  const gate = await getGate();
  if (!gate.allowed) return <GateNotice mode={gate.mode} next="/about" />;

  return <main className="shell about">
    <section className="panel about-intro">
      <img className="about-mark" src="/mark.svg" width={62} height={62} alt="" />
      <div><h1>About Nikushimi19</h1>
        <p>I make videos and work on game projects in my spare time. This hub brings my app downloads and setup guides together, including my Warcraft III – BVO project and the Monster Hunter builds I cover.</p>
        <ButtonLink href="/" variant="secondary"><Library size={17} aria-hidden="true" /> Browse downloads</ButtonLink>
      </div>
    </section>
    <div className="about-grid">
      <section className="panel about-card">
        <CirclePlay className="youtube-icon" size={25} aria-hidden="true" />
        <h2>YouTube</h2><p>Watch gameplay, setup walkthroughs, and project updates.</p>
        <a className={buttonClassName("quiet")} href={creatorLinks.youtube} target="_blank" rel="noreferrer">Watch on YouTube</a>
      </section>
      <section className="panel about-card">
        <HeartHandshake className="accent" size={25} aria-hidden="true" />
        <h2>Support the channel</h2><p>If you’d like to support my videos and projects, you can find the options on my support page.</p>
        <a className={buttonClassName("quiet")} href={creatorLinks.support} target="_blank" rel="noreferrer">Open support page</a>
      </section>
    </div>
    <p className="about-credits"><Gamepad2 size={18} aria-hidden="true" /><span>Thanks to the developers and contributors behind OceanTriRecomp, MH4U Native, AzaharPlus, Warsmash, and W3AndroidEngine.</span></p>
  </main>;
}
