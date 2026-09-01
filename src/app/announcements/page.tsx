import { Newspaper } from "lucide-react";
import { AnnouncementDirectory } from "@/components/announcement-directory";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Announcements() {
  const posts = await db.announcement.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, body: true, category: true, featuredImage: true, publishedAt: true },
  });
  const serialised = posts.map(post => ({ ...post, publishedAt: post.publishedAt?.toISOString() ?? null }));

  return <>
    <SiteHeader />
    <main className="page announcements-page">
      <section className="announcements-heading">
        <div><span><Newspaper />NALISS UPDATES</span><h1>Announcements &amp; Blog</h1><p>Stay informed with the latest election news, important announcements, and stories from the NALISS community.</p></div>
        <strong><i />Election updates live</strong>
      </section>
      <AnnouncementDirectory posts={serialised} />
    </main>
    <SiteFooter />
  </>;
}
