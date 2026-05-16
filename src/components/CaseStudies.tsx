"use client";

import { useEffect, useRef, useState } from "react";

const cases = [
  {
    industry: "E-Commerce · Fashion",
    client: "LuxeWear Co.",
    challenge: "Stagnant Instagram growth and poor ROAS on Meta ads after 6 months of in-house management.",
    strategy: "Rebuilt their ad funnel from scratch — custom audiences, UGC creatives, and retargeting sequences.",
    result: "+312% ROAS in 60 days",
    metrics: ["+312% ROAS", "60-day turnaround", "€18K → €74K monthly revenue"],
    color: "#0aad92",
    num: "01",
  },
  {
    industry: "SaaS · B2B",
    client: "Stackr Analytics",
    challenge: "Zero brand presence on LinkedIn despite a strong product. Struggling to generate inbound leads.",
    strategy: "Built a LinkedIn thought-leadership content engine with 3-4 high-value posts per week plus targeted paid campaigns.",
    result: "220 qualified leads in 90 days",
    metrics: ["220 qualified leads", "4.1% LinkedIn engagement rate", "8× organic reach growth"],
    color: "#5eead4",
    num: "02",
  },
  {
    industry: "Local Services · F&B",
    client: "Urban Brew Roasters",
    challenge: "Newly opened café with no digital footprint, competing against established chains.",
    strategy: "Hyperlocal Google & Meta ads combined with a UGC creator program. Revamped website with online ordering.",
    result: "Fully booked weekends in 45 days",
    metrics: ["Fully booked in 45 days", "+580% website traffic", "4.9★ Google rating"],
    color: "#0aad92",
    num: "03",
  },
];

export default function CaseStudies() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCase, setActiveCase] = useState(0);

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
          opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        });
        gsap.from(".case-tabs", {
          scrollTrigger: { trigger: ".case-tabs", start: "top 90%" },
          immediateRender: false,
          opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
        });
        gsap.from(".case-body", {
          scrollTrigger: { trigger: ".case-body", start: "top 90%" },
          immediateRender: false,
          opacity: 0, y: 50, duration: 0.9, ease: "power3.out",
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  const c = cases[activeCase];

  return (
    <section
      ref={sectionRef}
      id="work"
      className="section-pad"
      style={{ background: "linear-gradient(180deg, #061a16 0%, #042f28 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="work-header flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "#0aad92" }}>
              Case Studies
            </span>
            <h2
              className="font-extrabold text-white"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1.1 }}
            >
              Real brands.
              <br />
              <span className="text-gradient">Real results.</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            These aren't vanity metrics. They're revenue-impacting outcomes delivered within 90 days.
          </p>
        </div>

        {/* Tabs */}
        <div className="case-tabs flex flex-wrap gap-3 mb-10">
          {cases.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveCase(i)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: activeCase === i ? "linear-gradient(135deg,#085e51,#0aad92)" : "rgba(255,255,255,0.06)",
                color: activeCase === i ? "#fff" : "rgba(255,255,255,0.5)",
                border: activeCase === i ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {c.client}
            </button>
          ))}
        </div>

        {/* Case body */}
        <div
          key={activeCase}
          className="case-body rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(10,173,146,0.15)" }}
        >
          <div className="grid md:grid-cols-2">
            {/* Left — story */}
            <div className="p-10 xl:p-14" style={{ background: "rgba(8,94,81,0.15)" }}>
              <div className="flex items-center gap-3 mb-8">
                <span
                  className="text-xs font-medium tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: "rgba(10,173,146,0.15)", color: "#0aad92", border: "1px solid rgba(10,173,146,0.2)" }}
                >
                  {c.industry}
                </span>
              </div>

              <div className="space-y-6">
                {[
                  { label: "Challenge", text: c.challenge },
                  { label: "Our Strategy", text: c.strategy },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#0aad92" }}>
                      {item.label}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — results */}
            <div
              className="p-10 xl:p-14 flex flex-col justify-between"
              style={{ background: "rgba(4,47,40,0.8)" }}
            >
              <div>
                <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "#0aad92" }}>
                  Result
                </div>
                <div
                  className="font-extrabold leading-tight mb-8"
                  style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: c.color }}
                >
                  {c.result}
                </div>

                <div className="space-y-3">
                  {c.metrics.map((m, mi) => (
                    <div key={mi} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#0aad92" }} />
                      <span className="text-sm font-medium text-white">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgba(10,173,146,0.15)" }}>
                <div
                  className="text-6xl font-extrabold opacity-10"
                  style={{ fontFamily: "var(--font-fraunces)", color: "#0aad92" }}
                >
                  {c.num}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <p className="text-center mt-10 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Want results like these?{" "}
          <a href="#contact" className="underline hover:text-white transition-colors" style={{ color: "#0aad92" }}>
            Let's talk →
          </a>
        </p>
      </div>
    </section>
  );
}
