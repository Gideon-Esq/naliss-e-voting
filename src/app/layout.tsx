import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import "./admin-blog.css";
import { getConfiguredSiteUrl } from "@/lib/site-url";
import openGraphImage from "./opengraph-naliss.png";

const raleway = Raleway({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: getConfiguredSiteUrl() ?? new URL("http://localhost:3000"),
  title: "NALISS E-Voting",
  description: "Secure NALISS departmental elections",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
  openGraph: {
    title: "NALISS E-Voting",
    description: "Secure NALISS departmental elections",
    images: [
      {
        url: openGraphImage.src,
        width: openGraphImage.width,
        height: openGraphImage.height,
        alt: "NALISS E-Voting Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NALISS E-Voting",
    description: "Secure NALISS departmental elections",
    images: [openGraphImage.src],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={raleway.className}>
      <body>{children}</body>
    </html>
  );
}
