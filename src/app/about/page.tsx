import type { Metadata } from "next";
import InnerPageHero from "@/components/InnerPageHero";
import Stats from "@/components/Stats";
import CTA from "@/components/CTA";
import AboutTimeline from "@/components/AboutTimeline";
import AboutTeam from "@/components/AboutTeam";

export const metadata: Metadata = {
  title: "About Us — Our Story, Mission & Team",
  description:
    "Meet the team behind ReachLogic. 13+ years of combined expertise across social media, SEO, paid advertising and web development. Founded by Abul Hasan.",
  alternates: { canonical: "https://www.reachlogic.net/about" },
  openGraph: {
    title: "About ReachLogic — Our Story & Mission",
    description:
      "Meet the team behind ReachLogic. 13+ years of expertise. 700+ campaigns. A full-service digital marketing agency built on strategy and results.",
    url: "https://www.reachlogic.net/about",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* ── 1. HERO ── */}
      <InnerPageHero
        title="We Engineer Growth"
        description="ReachLogic is a full-service digital marketing agency built on 13+ years of real-world expertise, disciplined strategy, and an obsession with measurable results."
        tag="About ReachLogic"
      />

      {/* ── 2. FOUNDER QUOTE ── */}
      <section
        className="px-6 py-20 md:px-12 xl:px-0 max-w-6xl mx-auto"
        aria-label="Founder quote"
      >
        <div
          className="rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_2.25fr] gap-0"
          style={{ border: "1px solid rgba(10,173,146,0.15)" }}
        >
          {/* Photo panel */}
          <div
            className="relative min-h-[320px] md:min-h-0 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(10,173,146,0.18) 0%, rgba(6,26,22,0.95) 100%)",
            }}
          >
            <img 
              src="/images/abul-hasan.jpg" 
              alt="Abul Hasan" 
              className="w-full h-full object-cover" 
              style={{ objectPosition: "center 15%" }}
            />

            {/* Glow accent */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 30% 50%, rgba(10,173,146,0.2) 0%, transparent 60%)",
              }}
            />
          </div>

          {/* Quote panel */}
          <div
            className="flex items-center p-10 md:p-16"
            style={{ background: "rgba(10,173,146,0.03)" }}
          >
            <div>
              {/* Large decorative quote mark */}
              <div
                className="text-8xl font-bold leading-none -mb-4 -mt-4"
                style={{ color: "rgba(10,173,146,0.25)", fontFamily: "Georgia, serif" }}
                aria-hidden="true"
              >
                &ldquo;
              </div>
              <blockquote
                className="text-xl md:text-2xl font-medium text-white leading-relaxed"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Growth isn&apos;t accidental. It&apos;s engineered. Every brand I&apos;ve worked with taught me
                something new — and everything I&apos;ve learned over the past 13+ years went into building
                ReachLogic.
              </blockquote>
              <p className="mt-6 text-white/50 text-sm tracking-wide">
                — Abul Hasan, Founder & CEO, ReachLogic
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. AWARDS & RECOGNITION ── */}
      <section
        className="px-6 py-24 md:px-12 xl:px-0 max-w-6xl mx-auto"
        aria-label="Awards and recognition"
      >
        <div className="text-center mb-16">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4 inline-block"
            style={{
              background: "rgba(10,173,146,0.12)",
              border: "1px solid rgba(10,173,146,0.3)",
              color: "#0aad92",
            }}
          >
            Recognized
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mt-4"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Awards & Recognition
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Award 1 — BASIS */}
          <div
            className="rounded-2xl overflow-hidden group"
            style={{ border: "1px solid rgba(10,173,146,0.12)" }}
          >
            <img src="/images/basis-award.jpg" alt="BASIS Outsourcing Award 2021" className="w-full h-64 object-cover" />
            <div className="p-6" style={{ background: "rgba(10,173,146,0.04)" }}>
              <p className="text-white font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
                BASIS Outsourcing Award 2021
              </p>
              <p className="text-white/50 text-sm">District Level Top Awardee</p>
            </div>
          </div>

          {/* Award 2 — Upwork */}
          <div
            className="rounded-2xl overflow-hidden group"
            style={{ border: "1px solid rgba(10,173,146,0.12)" }}
          >
            <img src="/images/upwork-profile.png" alt="Upwork Personal Profile" className="w-full h-64 object-cover" />
            <div className="p-6" style={{ background: "rgba(10,173,146,0.04)" }}>
              <p className="text-white font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
                Upwork Profile
              </p>
              <p className="text-white/50 text-sm">Personal Profile Screenshot</p>
            </div>
          </div>
        </div>

        {/* BASIS Certification Detail */}
        <div
          className="mt-10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start"
          style={{
            background: "rgba(10,173,146,0.06)",
            border: "1px solid rgba(10,173,146,0.2)",
          }}
        >
          <div
            className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(10,173,146,0.15)" }}
          >
            <svg className="w-7 h-7 text-[#0aad92]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              BASIS Outsourcing Award 2021 — District Level Top Certification
            </h3>
            <p className="text-white/60 leading-relaxed text-sm md:text-base">
              Recognized by <span className="text-white font-medium">BASIS</span> (Bangladesh Association of
              Software and Information Services) as a top-performing outsourcing professional at the district
              level — one of the most prestigious honors in Bangladesh&apos;s IT and digital services industry.
            </p>
          </div>
        </div>
      </section>


      {/* ── 3. STATS BAR ── */}
      <Stats />

      {/* ── 4. OUR STORY ── */}
      <section className="px-6 py-24 md:px-12 xl:px-0 max-w-5xl mx-auto" aria-label="Our story">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-12 md:gap-20">
          {/* Sticky label */}
          <div className="md:pt-2">
            <span
              className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase inline-block"
              style={{
                background: "rgba(10,173,146,0.12)",
                border: "1px solid rgba(10,173,146,0.3)",
                color: "#0aad92",
              }}
            >
              Our Story
            </span>
          </div>

          {/* Prose */}
          <div className="space-y-6 text-white/65 text-base md:text-lg leading-relaxed">
            <p>
              ReachLogic didn&apos;t start as an agency. It started with one person, one laptop, and a genuine
              obsession with helping brands grow on social media.
            </p>
            <p>
              In 2012, Abul Hasan began his journey as a Social Media Strategist — learning the craft from the
              ground up, managing profiles, studying algorithms, and figuring out what actually moved the needle
              for real businesses. What started as freelance work quickly became a track record: brands growing,
              follower counts climbing, and clients coming back.
            </p>
            <p>
              By 2016, Abul had expanded his skill set far beyond social media. SEO, paid advertising, affiliate
              marketing, blogging, and WordPress all became part of the toolkit — driven not by a business plan,
              but by a simple desire to solve more problems for the people he worked with.
            </p>
            <p>
              In 2021, that expertise got its first official home: a boutique agency called{" "}
              <span className="text-white font-medium">Elevate Engage</span>. That same year, Abul was recognized
              with the{" "}
              <span className="text-[#0aad92] font-medium">
                BASIS Outsourcing Award at the district level
              </span>{" "}
              — one of Bangladesh&apos;s most respected honors in the IT and digital services industry.
            </p>
            <p>
              But as the team grew and the services expanded, it became clear that the brand needed to reflect the
              full picture. Elevate Engage became{" "}
              <span className="text-white font-medium">ReachLogic</span> — a name that says exactly what we do.
              We help brands move forward with logic: strategy, data, and disciplined execution.
            </p>
            <p>
              Today, ReachLogic is a full-service digital marketing agency with over 13 years of combined
              expertise, 700+ social media profiles managed, and 400+ clients served across social media, SEO,
              paid advertising, web development, and beyond.
            </p>
            <p className="text-white font-medium text-xl" style={{ fontFamily: "var(--font-fraunces)" }}>
              We&apos;re not a platform that promises growth. We&apos;re a team that engineers it.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. JOURNEY TIMELINE ── */}
      <AboutTimeline />

      {/* ── 6. VISION & MISSION ── */}
      <section
        className="px-6 py-24 md:px-12 xl:px-0 max-w-6xl mx-auto"
        aria-label="Vision and mission"
      >
        <div className="text-center mb-16">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4 inline-block"
            style={{
              background: "rgba(10,173,146,0.12)",
              border: "1px solid rgba(10,173,146,0.3)",
              color: "#0aad92",
            }}
          >
            Purpose
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mt-4"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            What Drives Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision */}
          <div
            className="rounded-2xl p-8 md:p-10 flex flex-col gap-6"
            style={{
              background: "rgba(10,173,146,0.04)",
              border: "1px solid rgba(10,173,146,0.12)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(10,173,146,0.15)" }}
            >
              {/* Eye icon */}
              <svg className="w-6 h-6 text-[#0aad92]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h3
                className="text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Our Vision
              </h3>
              <p className="text-white/60 leading-relaxed">
                We believe the best digital marketing doesn&apos;t shout — it connects. Our vision is a digital
                landscape where every brand, regardless of size, has access to the kind of strategic thinking and
                skilled execution that actually drives sustainable growth. We&apos;re building ReachLogic to be
                the agency that makes that possible.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div
            className="rounded-2xl p-8 md:p-10 flex flex-col gap-6"
            style={{
              background: "rgba(10,173,146,0.04)",
              border: "1px solid rgba(10,173,146,0.12)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(10,173,146,0.15)" }}
            >
              {/* Target icon */}
              <svg className="w-6 h-6 text-[#0aad92]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={1.5} stroke="currentColor" />
                <circle cx="12" cy="12" r="6" strokeWidth={1.5} stroke="currentColor" />
                <circle cx="12" cy="12" r="2" strokeWidth={1.5} stroke="currentColor" />
              </svg>
            </div>
            <div>
              <h3
                className="text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Our Mission
              </h3>
              <p className="text-white/60 leading-relaxed">
                Our mission is simple: engineer growth for every client we work with. Not short-term spikes. Not
                vanity metrics. Real, measurable results that compound over time — more reach, more engagement,
                more revenue. We treat every brand&apos;s digital presence the way we&apos;d treat our own: with
                strategy, care, and an unwavering focus on outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── 8. LEADERSHIP TEAM ── */}
      <AboutTeam />

      {/* ── 9. CTA ── */}
      <CTA />
    </>
  );
}
