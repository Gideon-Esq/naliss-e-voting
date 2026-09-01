"use client";
import { useEffect, useState } from "react";

export function Countdown({ target, label = "CLOSING IN" }: { target: string; label?: string }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(target).getTime() - Date.now()));
  useEffect(() => { const timer = setInterval(() => setRemaining(Math.max(0, new Date(target).getTime() - Date.now())), 1000); return () => clearInterval(timer); }, [target]);
  const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  return <div className="countdown"><strong>{label} <small className="countdown-zone">WAT</small></strong><div>{values.map((value, index) => <span key={index}><b>{String(value).padStart(2, "0")}</b><small>{["DAYS", "HRS", "MIN", "SEC"][index]}</small></span>)}</div></div>;
}
