"use client";

import { useEffect, useRef } from "react";

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".cta-content", {
          scrollTrigger: { trigger: ".cta-content", start: "top 90%" },
          immediateRender: false,
          opacity: 0, y: 50, duration: 1, ease: "power3.out",
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="section-pad relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #042f28 0%, #085e51 50%, #042f28 100%)" }}
    >
      {/* Background orb */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(10,173,146,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Decorative rings */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none spin-slow"
        style={{
          width: "600px", height: "600px",
          border: "1px solid rgba(10,173,146,0.08)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: "400px", height: "400px",
          border: "1px solid rgba(10,173,146,0.12)",
          animation: "spin-slow 15s linear infinite reverse",
        }}
      />

      <div className="cta-content relative z-10 max-w-3xl mx-auto text-center">
        <span className="inline-block text-xs font-medium tracking-widest uppercase mb-6" style={{ color: "#0aad92" }}>
          Let's Talk Growth
        </span>

        <h2
          className="font-extrabold text-white mb-6"
          style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2.2rem,6vw,4.5rem)", lineHeight: 1.05 }}
        >
          Your competitors aren't waiting.
          <br />
          <span className="text-gradient">Why are you?</span>
        </h2>

        <p className="text-base mb-10 mx-auto" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "520px" }}>
          Book a free 30-minute growth audit. We'll identify your biggest digital opportunities
          and show you exactly how to act on them — no pitch, just clarity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:hello@reachlogic.co"
            className="group px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 pulse-glow"
            style={{
              background: "linear-gradient(135deg,#fff 0%,#e8fdf9 100%)",
              color: "#085e51",
              fontSize: "0.95rem",
              minWidth: "220px",
            }}
          >
            Schedule My Free Audit{" "}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#services"
            className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-white/10"
            style={{
              border: "1px solid rgba(255,255,255,0.25)",
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.95rem",
              minWidth: "180px",
            }}
          >
            Browse Services
          </a>
        </div>

        {/* Trust micro-copy */}
        <p className="mt-8 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          No commitment required · Response within 24 hours · Available across time zones
        </p>
      </div>
    </section>
  );
}
