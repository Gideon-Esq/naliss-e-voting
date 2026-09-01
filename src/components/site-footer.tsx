import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return <footer><div><Logo/><p className="footer-name">ELECTORAL COMMISSION, NATIONAL ASSOCIATION OF LIBRARY &amp; INFORMATION SCIENCE STUDENTS</p><em>Information Is Power</em></div><div><b>Navigate</b><Link href="/">Home</Link><Link href="/election">Election</Link><Link href="/candidates">Candidates</Link><Link href="/about">About</Link></div><div><b>Legal</b><span>Privacy</span><span>Terms</span><span>Contact</span></div><p className="copyright">© 2026 NALISS Electoral Commission. All rights reserved.</p></footer>;
}
