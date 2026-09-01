import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import "./admin-blog.css";

const raleway = Raleway({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "NALISS E-Voting",
  description: "Secure NALISS departmental elections",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={raleway.className}><body>{children}</body></html>; }
