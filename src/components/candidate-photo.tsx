import Image from "next/image";

export function CandidatePhoto({ name, src, className = "" }: { name: string; src?: string | null; className?: string }) {
  const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("");
  return <span className={`candidate-photo ${className}`}>
    {src ? <Image unoptimized src={src} alt={`${name} portrait`} fill sizes="(max-width: 700px) 96px, 420px" /> : <span>{initials}</span>}
  </span>;
}
