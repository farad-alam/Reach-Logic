"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Discovery Call",
    sub: "30 minutes. No pitch.",
    body: "We learn your goals, your audience, your gaps, and your biggest growth blockers. Honest conversation, zero fluff.",
    icon: "🎙",
  },
  {
    num: "02",
    title: "Strategy Sprint",
    sub: "Your roadmap in 48 hours.",
    body: "We analyze your competitors, your current digital footprint, and your market opportunity — then deliver a custom 90-day growth plan.",
    icon: "🗺",
  },
  {
    num: "03",
    title: "Execution",
    sub: "Fast ships. Weekly visibility.",
    body: "Our team moves fast. You see progress every week with clear reports, campaign data, and open communication — no black boxes.",
    icon: "🚀",
  },
  {
    num: "04",
    title: "Scale & Optimise",
    sub: "We don't stop at results.",
    body: "Once results come in, we double down on what works and cut what doesn't. Your growth compounds — month over month, quarter over quarter.",
    icon: "📈",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".process-header", {
          scrollTrigger: { trigger: ".process-header", start: "top 90%" },
          immediateRender: false,
          opacity: 0, y: 40, duration: 0.8, ease: "power3.out",
        });
        gsap.from(".process-step", {
          scrollTrigger: { trigger: ".process-steps", start: "top 85%" },
          immediateRender: false,
          opacity: 0, y: 60, duration: 0.8, stagger: 0.15, ease: "power3.out",
        });
        /* Line draw */
        gsap.from(".process-line", {
          scrollTrigger: { trigger: ".process-steps", start: "top 75%" },
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.5,
          ease: "power3.inOut",
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="section-pad"
      style={{ background: "#042f28" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="process-header text-center mb-16">
          <span className="inline-block text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "#0aad92" }}>
            How We Work
          </span>
          <h2
            className="font-extrabold text-white"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1.1 }}
          >
            From first call to
            <br />
            <span className="text-gradient">measurable growth.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="process-steps relative">
          {/* Connecting line (desktop) */}
          <div
            className="process-line hidden xl:block absolute top-12 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(10,173,146,0.3), rgba(10,173,146,0.3), transparent)", zIndex: 0 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 relative z-10">
            {steps.map((s, i) => (
              <div key={i} className="process-step flex flex-col items-start gap-5">
                {/* Icon circle */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl relative shrink-0"
                  style={{
                    background: "rgba(8,94,81,0.3)",
                    border: "1px solid rgba(10,173,146,0.25)",
                    boxShadow: "0 0 30px rgba(10,173,146,0.1)",
                  }}
                >
                  {s.icon}
                  {/* Step number badge */}
                  <span
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "#0aad92", color: "#fff" }}
                  >
                    {i + 1}
                  </span>
                </div>

                <div>
                  <div
                    className="text-xs font-semibold tracking-widest uppercase mb-1"
                    style={{ color: "#0aad92" }}
                  >
                    Step {s.num}
                  </div>
                  <h3
                    className="text-xl font-bold text-white mb-1"
                    style={{ fontFamily: "var(--font-fraunces)" }}
                  >
                    {s.title}
                  </h3>
                  <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {s.sub}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-16 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ background: "rgba(8,94,81,0.15)", border: "1px solid rgba(10,173,146,0.15)" }}
        >
          <div>
            <h3
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Ready to start your growth story?
            </h3>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Book your free discovery call. No commitment, no pressure — just clarity.
            </p>
          </div>
          <a
            href="#contact"
            className="shrink-0 px-7 py-3.5 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{ background: "linear-gradient(135deg,#085e51,#0aad92)", boxShadow: "0 0 30px rgba(10,173,146,0.3)" }}
          >
            Book Discovery Call →
          </a>
        </div>
      </div>
    </section>
  );
}
