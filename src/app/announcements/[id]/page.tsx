import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Megaphone, Newspaper } from "lucide-react";
import { notFound } from "next/navigation";
import { ArticleShare } from "@/components/article-share";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, related] = await Promise.all([
    db.announcement.findFirst({ where: { id, status: "PUBLISHED" } }),
    db.announcement.findMany({ where: { status: "PUBLISHED", id: { not: id } }, orderBy: { publishedAt: "desc" }, take: 3, select: { id: true, title: true, publishedAt: true } }),
  ]);
  if (!post) notFound();
  const blocks = post.body.split(/\n\s*\n|\n/).map(block => block.trim()).filter(Boolean);
  const published = post.publishedAt?.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }) ?? "Recently published";

  return <>
    <SiteHeader />
    <main className="page article-page">
      <nav className="article-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight /><Link href="/announcements">Announcements</Link><ChevronRight /><span>{post.title}</span></nav>
      <div className="article-layout">
        <article className="article-main">
          <span className="article-category"><Newspaper />{post.category}</span>
          <h1>{post.title}</h1>
          {blocks[0] && <p className="article-intro">{blocks[0]}</p>}
          <div className="article-byline-row"><div className="article-author"><b>NA</b><span><strong>NALISS Communications</strong><small>Published {published} · 5 min read</small></span></div><ArticleShare title={post.title} /></div>
          <div className="article-hero-media">{post.featuredImage ? <Image unoptimized fill priority sizes="(max-width: 800px) 100vw, 800px" src={post.featuredImage} alt="" /> : <><div><Megaphone /></div><span>Featured</span></>}</div>
          <div className="article-body">{blocks.slice(1).map((block, index) => {
            const heading = block.match(/^#{1,3}\s+(.+)/);
            if (heading) return <h2 key={`${index}-${block.slice(0, 20)}`}>{heading[1]}</h2>;
            const list = block.match(/^\d+[.)]\s+(.+)/);
            if (list) return <div className="article-step" key={`${index}-${block.slice(0, 20)}`}><b>{block.match(/^\d+/)?.[0]}</b><p>{list[1]}</p></div>;
            return <p key={`${index}-${block.slice(0, 20)}`}>{block}</p>;
          })}</div>
        </article>

        <aside className="related-announcements"><h2>Related Announcements</h2><p>Continue exploring NALISS updates</p>{related.length ? related.map(item => <Link href={`/announcements/${item.id}`} key={item.id}><strong>{item.title}</strong><small>{item.publishedAt?.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" })}</small></Link>) : <small>No other published updates yet.</small>}</aside>
      </div>
      <section className="article-cta"><div><h2>Get ready to make your voice heard</h2><p>Verify your identity early and be ready when voting opens.</p></div><Link href="/login">Login / Vote <ArrowRight /></Link></section>
    </main>
    <SiteFooter />
  </>;
}
