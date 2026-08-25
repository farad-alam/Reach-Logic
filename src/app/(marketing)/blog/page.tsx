import type { Metadata } from "next";
import Link from "next/link";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "Blog — Growth Insights & Marketing Strategies",
  description:
    "The Reach Logic blog. Actionable insights on social media, paid advertising, SEO, and digital growth strategy from our team of expert growth engineers.",
  alternates: { canonical: "https://www.reachlogic.net/blog" },
  openGraph: {
    title: "Blog — Growth Insights & Marketing Strategies",
    description:
      "Actionable insights on social media, paid advertising, SEO, and digital growth strategy from Reach Logic's team of experts.",
    url: "https://www.reachlogic.net/blog",
  },
};

const categories = ["All", "Social Media", "Paid Ads", "SEO", "Web Design", "Strategy"];

const posts = [
  {
    title: "The Future of Social Media Automation: How AI is Reshaping Content Strategy in 2027",
    excerpt:
      "AI-powered scheduling and content repurposing are no longer optional. We break down the tools and tactics top brands are using right now to stay ahead.",
    category: "Social Media",
    date: "Oct 12, 2026",
    dateTime: "2026-10-12",
    readTime: "7 min read",
    image: "/blog-social-media.jpg",
    featured: true,
  },
  {
    title: "Why Your ROAS is Dropping — And the 5-Step Fix",
    excerpt:
      "Ad costs are rising but your returns are shrinking. Here's exactly where to look and how to bring your return on ad spend back to where it should be.",
    category: "Paid Ads",
    date: "Sep 28, 2026",
    dateTime: "2026-09-28",
    readTime: "5 min read",
    image: "/blog-paid-ads.jpg",
    featured: false,
  },
  {
    title: "How to Build a Website That Actually Converts",
    excerpt:
      "Most agency websites look great and convert terribly. We share the design principles and copywriting patterns that move visitors from curious to clients.",
    category: "Web Design",
    date: "Sep 15, 2026",
    dateTime: "2026-09-15",
    readTime: "6 min read",
    image: "/blog-seo-web.jpg",
    featured: false,
  },
  {
    title: "Scaling Internationally: A Digital Growth Playbook for Ambitious Brands",
    excerpt:
      "Going global is harder than it looks. From localised content strategy to cross-border ad campaigns, here's the full playbook we use for our own clients.",
    category: "Strategy",
    date: "Aug 30, 2026",
    dateTime: "2026-08-30",
    readTime: "9 min read",
    image: "/blog-strategy.jpg",
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  "Social Media": "#0aad92",
  "Paid Ads": "#f59e0b",
  "Web Design": "#8b5cf6",
  SEO: "#10b981",
  Strategy: "#3b82f6",
};

export default function BlogPage() {
  const featured = posts.find((p) => p.featured)!;
  const rest = posts.filter((p) => !p.featured);

  return (
    <>
      {/* ── Page Header ── */}
      <section
        className="relative overflow-hidden pt-40 pb-20 px-6"
        style={{ background: "linear-gradient(160deg, #042f28 0%, #061a16 60%, #020f0c 100%)" }}
      >
        {/* Glowing orb */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 rounded-full pointer-events-none"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(10,173,146,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative max-w-7xl mx-auto">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(10,173,146,0.1)",
              border: "1px solid rgba(10,173,146,0.25)",
              color: "#0aad92",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#0aad92", boxShadow: "0 0 6px #0aad92" }}
            />
            The Reach Logic Blog
          </div>

          {/* Headline */}
          <h1
            className="font-extrabold leading-none mb-6"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(3rem, 8vw, 7rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Ideas.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0aad92 0%, #5eead4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Solutions.
            </span>{" "}
            Growth.
          </h1>

          <p className="text-white/50 max-w-xl" style={{ fontSize: "clamp(1rem, 1.8vw, 1.15rem)", lineHeight: 1.7 }}>
            Where the Reach Logic team shares expert thinking on digital growth, marketing strategy, and the tools that move brands forward.
          </p>

          {/* Category filters */}
          <div className="flex flex-wrap gap-3 mt-10">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  i === 0
                    ? {
                        background: "linear-gradient(135deg, #085e51, #0aad92)",
                        color: "#fff",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.5)",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Post ── */}
      <section className="max-w-7xl mx-auto px-6 xl:px-12 -mt-2 pt-16">
        <div className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: "#0aad92" }}>
          Featured Article
        </div>

        <Link href="#" className="group block">
          <article className="relative rounded-3xl overflow-hidden" style={{ minHeight: "520px" }}>
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${featured.image})` }}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(2,15,12,0.97) 0%, rgba(2,15,12,0.85) 50%, rgba(2,15,12,0.3) 100%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-10 md:p-16 flex flex-col justify-end h-full" style={{ minHeight: "520px" }}>
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                    style={{ background: "rgba(10,173,146,0.15)", color: "#0aad92", border: "1px solid rgba(10,173,146,0.3)" }}
                  >
                    {featured.category}
                  </span>
                  <time className="text-xs text-white/40" dateTime={featured.dateTime}>
                    {featured.date}
                  </time>
                  <span className="text-xs text-white/30">·</span>
                  <span className="text-xs text-white/40">{featured.readTime}</span>
                </div>

                <h2
                  className="font-extrabold leading-tight mb-5 text-white group-hover:text-[#0aad92] transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: "clamp(1.6rem, 3.5vw, 3rem)",
                  }}
                >
                  {featured.title}
                </h2>

                <p className="text-white/55 mb-8 leading-relaxed" style={{ fontSize: "1.05rem", maxWidth: "560px" }}>
                  {featured.excerpt}
                </p>

                <div
                  className="inline-flex items-center gap-2 font-semibold text-sm transition-all duration-300 group-hover:gap-4"
                  style={{ color: "#0aad92" }}
                >
                  Read Article <span className="text-lg">→</span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      </section>

      {/* ── Post Grid ── */}
      <section className="max-w-7xl mx-auto px-6 xl:px-12 py-16">
        <div className="text-xs font-semibold tracking-widest uppercase mb-8" style={{ color: "#0aad92" }}>
          Latest Articles
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post, i) => (
            <Link href="#" key={i} className="group">
              <article
                className="rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(10,173,146,0.25)] hover:shadow-[0_20px_60px_rgba(10,173,146,0.08)]"
                style={{
                  background: "#020f0c",
                }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: "220px" }}>
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                      style={{
                        background: "rgba(2,15,12,0.8)",
                        color: categoryColors[post.category] || "#0aad92",
                        border: `1px solid ${categoryColors[post.category] || "#0aad92"}40`,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <time className="text-xs text-white/35" dateTime={post.dateTime}>
                      {post.date}
                    </time>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-xs text-white/35">{post.readTime}</span>
                  </div>

                  <h3
                    className="font-bold mb-3 leading-snug text-white group-hover:text-[#0aad92] transition-colors duration-300 flex-1"
                    style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.2rem" }}
                  >
                    {post.title}
                  </h3>

                  <p className="text-sm text-white/45 mb-6 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 group-hover:gap-3"
                    style={{ color: "#0aad92" }}
                  >
                    Read Article <span>→</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}

          {/* Newsletter CTA card */}
          <div
            className="rounded-2xl p-8 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, rgba(8,94,81,0.3) 0%, rgba(10,173,146,0.08) 100%)",
              border: "1px solid rgba(10,173,146,0.2)",
            }}
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 text-xl"
                style={{ background: "rgba(10,173,146,0.15)", border: "1px solid rgba(10,173,146,0.2)" }}
              >
                ✦
              </div>
              <h3
                className="font-bold text-xl mb-3 leading-snug"
                style={{ fontFamily: "var(--font-fraunces)", color: "#fff" }}
              >
                Stay ahead of the curve.
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-8">
                Get our best insights on growth, strategy, and digital marketing delivered to your inbox every two weeks.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <button
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #085e51, #0aad92)" }}
              >
                Subscribe — It&apos;s Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Topics Stripe ── */}
      <section
        className="py-16 px-6"
        style={{ background: "#020f0c", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-xs font-semibold tracking-widest uppercase mb-8" style={{ color: "#0aad92" }}>
            Browse by Topic
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Social Media", count: "12 articles" },
              { label: "Paid Advertising", count: "8 articles" },
              { label: "SEO & Content", count: "10 articles" },
              { label: "Web Design", count: "6 articles" },
              { label: "Brand Strategy", count: "9 articles" },
              { label: "Video Production", count: "5 articles" },
              { label: "Growth Tactics", count: "14 articles" },
            ].map((topic) => (
              <Link
                key={topic.label}
                href="#"
                className="group flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] hover:bg-[rgba(10,173,146,0.08)] hover:border-[rgba(10,173,146,0.2)]"
              >
                <span className="text-sm font-semibold text-white/75 group-hover:text-white transition-colors">
                  {topic.label}
                </span>
                <span className="text-xs text-white/30">
                  {topic.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
