import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return <Link className="brand" href="/" aria-label="NALISS Electoral Commission home"><Image className="brand-logo" src="/naliss-logo.png" width={64} height={64} alt="NALISS emblem"/><span><b>NALISS</b><small>Electoral Commission</small></span></Link>;
}
