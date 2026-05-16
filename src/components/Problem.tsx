"use client";

import { useEffect, useRef } from "react";

const panels = [
  {
    stat: "73%",
    label: "of brands post content consistently but see no real growth.",
    headline: "You're posting. You're not growing.",
    body: "Showing up online without a strategy is like shouting into the void. Consistency alone doesn't move the needle — intelligent, targeted content does.",
    color: "#0aad92",
  },
  {
    stat: "62%",
    label: "of ad budgets are wasted on unqualified audiences.",
    headline: "Running ads? You might be burning money.",
    body: "Without data-driven targeting, your paid campaigns reach people who will never convert. Every click that doesn't convert is money you'll never get back.",
    color: "#0aad92",
  },
  {
    stat: "3.8×",
    label: "average ROAS our clients see within the first 90 days.",
    headline: "Reach Logic bridges the gap.",
    body: "We combine automation, creative strategy, and relentless data analysis to turn your digital presence into a revenue machine — predictably, scalably, globally.",
    color: "#0aad92",
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            immediateRender: false,
            opacity: 0,
            y: 60,
            duration: 0.9,
            delay: i * 0.12,
            ease: "power3.out",
          });
        });

        gsap.from(".problem-header", {
          scrollTrigger: { trigger: ".problem-header", start: "top 90%" },
          immediateRender: false,
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pad"
      style={{ background: "linear-gradient(180deg, #042f28 0%, #061a16 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="problem-header text-center mb-16">
          <span
            className="inline-block text-xs font-medium tracking-widest uppercase mb-4"
            style={{ color: "#0aad92" }}
          >
            The Reality
          </span>
          <h2
            className="font-extrabold text-white"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
          >
            Most brands are online.
            <br />
            <span className="text-gradient">Few are winning.</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {panels.map((p, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="rounded-2xl p-8 flex flex-col gap-5 relative overflow-hidden"
              style={{
                background: "rgba(8,94,81,0.12)",
                border: "1px solid rgba(10,173,146,0.15)",
              }}
            >
              {/* Glow corner */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full"
                style={{ background: "rgba(10,173,146,0.06)" }}
              />

              <div
                className="text-5xl font-extrabold"
                style={{ fontFamily: "var(--font-fraunces)", color: p.color }}
              >
                {p.stat}
              </div>
              <p className="text-xs tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
                {p.label}
              </p>
              <hr style={{ borderColor: "rgba(10,173,146,0.15)" }} />
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {p.headline}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
