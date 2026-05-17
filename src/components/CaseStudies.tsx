"use client";

import { useEffect, useRef, useState } from "react";

const cases = [
  {
    industry: "E-Commerce · Fashion",
    client: "LuxeWear Co.",
    num: "01",
    challenge:
      "Stagnant Instagram growth and poor ROAS on Meta ads after 6 months of in-house management.",
    strategy:
      "Rebuilt their ad funnel from scratch — custom audiences, UGC creatives, and retargeting sequences.",
    result: "+312%",
    resultLabel: "ROAS in 60 days",
    metrics: ["+312% ROAS", "60-day turnaround", "€18K → €74K monthly revenue"],
    accent: "#0aad92",
  },
  {
    industry: "SaaS · B2B",
    client: "Stackr Analytics",
    num: "02",
    challenge:
      "Zero brand presence on LinkedIn despite a strong product. Struggling to generate inbound leads.",
    strategy:
      "Built a LinkedIn thought-leadership content engine with 3–4 high-value posts per week plus targeted paid campaigns.",
    result: "220",
    resultLabel: "qualified leads in 90 days",
    metrics: ["220 qualified leads", "4.1% LinkedIn engagement rate", "8× organic reach growth"],
    accent: "#5eead4",
  },
  {
    industry: "Local Services · F&B",
    client: "Urban Brew Roasters",
    num: "03",
    challenge:
      "Newly opened café with no digital footprint, competing against established chains.",
    strategy:
      "Hyperlocal Google & Meta ads combined with a UGC creator program. Revamped website with online ordering.",
    result: "45",
    resultLabel: "days to fully booked weekends",
    metrics: ["Fully booked in 45 days", "+580% website traffic", "4.9★ Google rating"],
    accent: "#0aad92",
  },
];

export default function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);  // tall div — provides scroll room
  const trackRef   = useRef<HTMLDivElement>(null);  // horizontal flex row
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  /* ── Set wrapper height after mount (and on resize) ── */
  useEffect(() => {
    const sync = () => {
      const track   = trackRef.current;
      const wrapper = wrapperRef.current;
      if (!track || !wrapper) return;
      const maxX  = track.scrollWidth - window.innerWidth;
      // wrapper height = 100vh (for the sticky view) + the horizontal travel distance
      wrapper.style.height = `${window.innerHeight + Math.max(0, maxX) + 80}px`;
    };

    sync();

    const ro = new ResizeObserver(sync);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  /* ── Scroll → translateX ────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      const track   = trackRef.current;
      if (!wrapper || !track) return;

      const { top }   = wrapper.getBoundingClientRect();
      const scrollRoom = wrapper.offsetHeight - window.innerHeight;
      const t = Math.max(0, Math.min(1, -top / scrollRoom));
      const maxX = track.scrollWidth - window.innerWidth;

      track.style.transform = `translateX(${-t * maxX}px)`;
      setProgress(t);

      // active dot
      const cardW = track.scrollWidth / (cases.length + 1);
      const idx   = Math.round((t * maxX) / cardW);
      setActive(Math.max(0, Math.min(idx, cases.length - 1)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Header scroll reveal ───────────────────────────── */
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".work-header", {
          scrollTrigger: { trigger: ".work-header", start: "top 90%" },
          immediateRender: false,
          opacity: 0, y: 40, filter: "blur(10px)", duration: 0.9, ease: "power3.out",
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      style={{ background: "linear-gradient(180deg, #061a16 0%, #042f28 100%)" }}
    >
      {/* ── Tall wrapper — gives the page scroll room ──── */}
      <div ref={wrapperRef} style={{ position: "relative" }}>

        {/* ── Sticky panel — stays in view while scrolling ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Header — absolute at top of sticky panel */}
          <div
            className="work-header absolute top-0 left-0 right-0 z-10"
            style={{ padding: "3.5rem max(1.5rem, calc((100vw - 1280px)/2 + 1.5rem)) 1rem" }}
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 max-w-7xl mx-auto">
              <div>
                <span
                  className="inline-block text-xs font-medium tracking-widest uppercase mb-3"
                  style={{ color: "#0aad92" }}
                >
                  Case Studies
                </span>
                <h2
                  className="font-extrabold text-white"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontSize: "clamp(1.8rem,4vw,3rem)",
                    lineHeight: 1.1,
                  }}
                >
                  Real brands.{" "}
                  <span className="text-gradient">Real results.</span>
                </h2>
              </div>
              <p
                className="text-sm max-w-xs"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Revenue-impacting outcomes within 90 days — not vanity metrics.
              </p>
            </div>
          </div>

          {/* Cards track — absolutely fills the sticky panel, centred */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              paddingTop: "clamp(120px, 18vh, 160px)", // clear the header
            }}
          >
            <div
              ref={trackRef}
              style={{
                display: "flex",
                gap: "1.25rem",
                paddingLeft:  "max(1.5rem, calc((100vw - 1280px)/2 + 1.5rem))",
                paddingRight: "max(1.5rem, calc((100vw - 1280px)/2 + 1.5rem))",
                willChange: "transform",
                alignItems: "stretch",
              }}
            >
              {cases.map((c, i) => (
                <div
                  key={i}
                  className="shrink-0 rounded-3xl flex flex-col overflow-hidden"
                  style={{
                    width: "min(80vw, 620px)",
                    height: "min(62vh, 460px)",
                    border: "1px solid rgba(10,173,146,0.15)",
                  }}
                >
                  {/* Top band */}
                  <div
                    className="px-8 pt-8 pb-6 relative flex-shrink-0"
                    style={{ background: "rgba(8,94,81,0.22)" }}
                  >
                    {/* Ghost number */}
                    <div
                      className="absolute top-4 right-6 font-extrabold pointer-events-none select-none"
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontSize: "5.5rem",
                        color: "#0aad92",
                        opacity: 0.065,
                        lineHeight: 1,
                      }}
                    >
                      {c.num}
                    </div>

                    <span
                      className="inline-block text-xs font-medium tracking-widest uppercase px-3 py-1 rounded-full mb-4"
                      style={{
                        background: "rgba(10,173,146,0.15)",
                        color: "#0aad92",
                        border: "1px solid rgba(10,173,146,0.25)",
                      }}
                    >
                      {c.industry}
                    </span>

                    <h3
                      className="text-xl font-extrabold text-white mb-4"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      {c.client}
                    </h3>

                    {/* Hero stat */}
                    <div className="flex items-end gap-3">
                      <div
                        className="font-extrabold leading-none"
                        style={{
                          fontFamily: "var(--font-fraunces)",
                          fontSize: "clamp(2.4rem,6vw,3.8rem)",
                          color: c.accent,
                        }}
                      >
                        {c.result}
                      </div>
                      <div
                        className="text-xs font-medium pb-1.5"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {c.resultLabel}
                      </div>
                    </div>
                  </div>

                  {/* Bottom — story */}
                  <div
                    className="px-8 py-6 flex flex-col gap-4 flex-1 overflow-hidden"
                    style={{ background: "rgba(4,47,40,0.92)" }}
                  >
                    <div>
                      <div
                        className="text-xs font-semibold tracking-widest uppercase mb-1.5"
                        style={{ color: "#0aad92" }}
                      >
                        Challenge
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {c.challenge}
                      </p>
                    </div>
                    <div>
                      <div
                        className="text-xs font-semibold tracking-widest uppercase mb-1.5"
                        style={{ color: "#0aad92" }}
                      >
                        Our Strategy
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {c.strategy}
                      </p>
                    </div>

                    {/* Metric chips */}
                    <div
                      className="flex flex-wrap gap-1.5 mt-auto pt-3"
                      style={{ borderTop: "1px solid rgba(10,173,146,0.1)" }}
                    >
                      {c.metrics.map((m, mi) => (
                        <span
                          key={mi}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(10,173,146,0.08)",
                            color: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(10,173,146,0.1)",
                          }}
                        >
                          <span style={{ color: "#0aad92", fontSize: "0.45rem" }}>◆</span>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* CTA card */}
              <div
                className="shrink-0 rounded-3xl flex flex-col items-center justify-center gap-5 text-center px-10"
                style={{
                  width: "min(55vw, 300px)",
                  height: "min(62vh, 460px)",
                  background: "linear-gradient(135deg, #085e51 0%, #0aad92 100%)",
                  border: "1px solid rgba(10,173,146,0.3)",
                }}
              >
                <div
                  className="text-xs tracking-widest uppercase font-medium"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Ready?
                </div>
                <h3
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  You could be next.
                </h3>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:gap-4"
                  style={{ color: "#085e51" }}
                >
                  Let&apos;s talk <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Scroll progress bar ── */}
          <div
            className="absolute bottom-8 left-0 right-0 px-6 flex flex-col items-center gap-3"
            style={{ zIndex: 10 }}
          >
            {/* Progress scrubber */}
            <div
              className="rounded-full overflow-hidden"
              style={{
                width: "min(320px, 60vw)",
                height: "2px",
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: `${progress * 100}%`,
                  background: "linear-gradient(90deg, #085e51, #0aad92)",
                  boxShadow: "0 0 6px rgba(10,173,146,0.5)",
                }}
              />
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {cases.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: active === i ? "22px" : "5px",
                    height: "5px",
                    background: active === i ? "#0aad92" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>

            {/* Scroll hint */}
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Scroll to explore
            </div>
          </div>
        </div>
      </div>

      {/* ── Post-sticky footer ── */}
      <div
        className="text-center"
        style={{ padding: "3.5rem 1.5rem" }}
      >
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Want results like these?{" "}
          <a
            href="#contact"
            className="underline hover:text-white transition-colors"
            style={{ color: "#0aad92" }}
          >
            Let&apos;s talk →
          </a>
        </p>
      </div>
    </section>
  );
}
