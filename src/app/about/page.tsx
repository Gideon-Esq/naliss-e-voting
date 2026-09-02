import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Megaphone,
  Quote,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const team = [
  {
    name: "Gideon Oluwatomiwa AYODELE",
    role: "Electoral Chairman",
    duty: "Provides electoral leadership and safeguards a fair, credible, and transparent election.",
    image: "/gideon-oluwatomiwa-ayodele.png",
    Icon: Scale,
  },
  {
    name: "Ayooluwa Gideon OLOYEDE",
    role: "General Secretary, NALISS",
    duty: "Serves the association as the General Secretary of NALISS.",
    image: "/ayooluwa-gideon-oloyede-clean.png",
    Icon: ClipboardCheck,
  },
  {
    name: "Emmanuel Oluwaseyi OLULOWO",
    role: "Public Relations Officer (PRO)",
    duty: "Coordinates official publicity and voter communication for the Electoral Commission.",
    image: null,
    Icon: Megaphone,
  },
  {
    name: "Solomon Ayomide OLARINRE",
    role: "Electoral Committee Member",
    duty: "Served on the NALISS Electoral Committee for the 2024/2025 academic session.",
    image: "/olarine_solomon.png",
    Icon: BadgeCheck,
  },
  {
    name: null,
    role: "Electoral Committee Member",
    duty: "Additional Electoral Commission member.",
    image: null,
    Icon: ShieldCheck,
  },
] as const;

export default function About() {
  return (
    <>
      <SiteHeader />
      <main className="page about-page">
        <section className="about-card">
          <div>
            <span className="about-chip">
              <Sparkles />
              About the commission
            </span>
            <h1>About NALISS</h1>
            <p>
              The Electoral Commission of the National Association of Library
              and Information Science Students administers a fair, secure, and
              credible departmental election. Through this verified e-voting
              platform, we protect every eligible voice and make every vote
              count.
            </p>
            <strong>
              <Quote />
              Information Is Power
            </strong>
          </div>
          <div className="about-mark" aria-label="NALISS">
            <ShieldCheck />
            <small>NALISS</small>
          </div>
        </section>

        <section className="about-team-heading">
          <div>
            <span>THE PEOPLE BEHIND THE ELECTION</span>
            <h2>Meet the Electoral Commission</h2>
          </div>
          <p>
            Officials committed to a transparent and credible NALISS election.
          </p>
        </section>
        <div className="about-team-grid">
          {team.map(({ name, role, duty, image, Icon }) => (
            <article key={name ?? role}>
              <div className={`about-team-avatar${image ? " has-photo" : ""}`}>
                {image ? (
                  <Image
                    src={image}
                    width={180}
                    height={180}
                    alt={`${name}, ${role}`}
                  />
                ) : (
                  <Icon />
                )}
              </div>
              <h3>{name ?? role}</h3>
              <span>{name ? role : "Electoral Commission"}</span>
              <p>{duty}</p>
            </article>
          ))}
        </div>

        <section className="about-cta">
          <div>
            <h2>Ready to make your voice count?</h2>
            <p>
              Review the candidates and participate in the NALISS departmental
              election.
            </p>
          </div>
          <Link href="/election">
            View Election <ArrowRight />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
