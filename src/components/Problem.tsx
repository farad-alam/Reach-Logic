"use client";

import { useEffect, useRef } from "react";

const panels = [
  {
    num: "01",
    stat: "73%",
    statLabel: "of brands post consistently but see zero real growth.",
    headline: "You're posting. You're not growing.",
    body: "Showing up online without a strategy is like shouting into the void. Consistency alone doesn't move the needle — intelligent, targeted content does.",
    icon: "📊",
  },
  {
    num: "02",
    stat: "62%",
    statLabel: "of ad budgets are wasted on unqualified audiences.",
    headline: "Running ads? You might be burning money.",
    body: "Without data-driven targeting, your paid campaigns reach people who will never convert. Every click that doesn't convert is money you'll never get back.",
    icon: "🔥",
  },
  {
    num: "03",
    stat: "3.8×",
    statLabel: "average ROAS our clients see within the first 90 days.",
    headline: "Reach Logic bridges the gap.",
    body: "We combine automation, creative strategy, and relentless data analysis to turn your digital presence into a revenue machine — predictably, scalably, globally.",
    icon: "🚀",
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── Header reveal ──────────────────────────────── */
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".problem-header", {
          scrollTrigger: { trigger: ".problem-header", start: "top 90%" },
          immediateRender: false,
          opacity: 0,
          y: 40,
          filter: "blur(10px)",
          duration: 0.9,
          ease: "power3.out",
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  /* ── Stacked card scale-down via scroll ────────── */
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const onScroll = () => {
      const stackRect = stack.getBoundingClientRect();
      // pixels scrolled past the top of the stack container
      const scrolled = -stackRect.top;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        // When does this card start fading? When the NEXT card starts coming in
        const outStart = i * window.innerHeight;
        const outEnd = outStart + window.innerHeight;
        const t = Math.max(0, Math.min(1, (scrolled - outStart) / window.innerHeight));

        // Last panel — never scale down
        if (i === panels.length - 1) {
          card.style.transform = "scale(1) translateY(0px)";
          card.style.opacity = "1";
          return;
        }

        if (scrolled < outStart) {
          card.style.transform = "scale(1) translateY(0px)";
          card.style.opacity = "1";
        } else if (scrolled > outEnd) {
          card.style.transform = "scale(0.88) translateY(-44px)";
          card.style.opacity = "0";
        } else {
          const scale = 1 - t * 0.12;
          const y = -t * 44;
          const opacity = 1 - t * 1;
          card.style.transform = `scale(${scale}) translateY(${y}px)`;
          card.style.opacity = `${Math.max(0, opacity)}`;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial call
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="problem"
      style={{ background: "linear-gradient(180deg, #042f28 0%, #061a16 100%)" }}
    >
      {/* Header — scrolls away normally */}
      <div
        ref={headerRef}
        className="problem-header text-center max-w-7xl mx-auto px-6"
        style={{ paddingTop: "6rem", paddingBottom: "4rem" }}
      >
        <span
          className="inline-block text-xs font-medium tracking-widest uppercase mb-4"
          style={{ color: "#0aad92" }}
        >
          The Reality
        </span>
        <h2
          className="font-extrabold text-white"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
          }}
        >
          Most brands are online.
          <br />
          <span className="text-gradient">Few are winning.</span>
        </h2>
      </div>

      {/* Sticky stack container — each panel is 100vh tall */}
      <div
        ref={stackRef}
        className="relative"
        style={{ height: `${panels.length * 100}vh` }}
      >
        {panels.map((p, i) => (
          <div
            key={i}
            ref={(el) => { panelRefs.current[i] = el; }}
            className="sticky top-0 flex items-center justify-center"
            style={{
              height: "100vh",
              zIndex: i + 10,
              pointerEvents: i === panels.length - 1 ? "auto" : "none",
            }}
          >
            {/* Card */}
            <div
              ref={(el) => { cardRefs.current[i] = el; }}
              className="panel-card mx-6 rounded-3xl overflow-hidden w-full"
              style={{
                maxWidth: "860px",
                border: "1px solid rgba(10,173,146,0.18)",
                willChange: "transform, opacity",
                transition: "transform 0.05s linear, opacity 0.05s linear",
                pointerEvents: "auto",
              }}
            >
              <div
                className="grid md:grid-cols-[1fr_1.4fr]"
                style={{ background: "rgba(4,47,40,0.97)", backdropFilter: "blur(20px)" }}
              >
                {/* Left — stat */}
                <div
                  className="flex flex-col justify-center gap-4 p-10 xl:p-14 relative overflow-hidden"
                  style={{ background: "rgba(8,94,81,0.2)" }}
                >
                  {/* Ghost number */}
                  <div
                    className="absolute bottom-4 right-4 font-extrabold pointer-events-none"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontSize: "7rem",
                      color: "#0aad92",
                      opacity: 0.05,
                      lineHeight: 1,
                    }}
                  >
                    {p.num}
                  </div>

                  <span className="text-3xl">{p.icon}</span>

                  <div
                    className="font-extrabold leading-none"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontSize: "clamp(3rem, 7vw, 5rem)",
                      color: "#0aad92",
                    }}
                  >
                    {p.stat}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {p.statLabel}
                  </p>

                  {/* Step indicator */}
                  <div className="flex gap-1.5 mt-2">
                    {panels.map((_, j) => (
                      <div
                        key={j}
                        className="h-0.5 rounded-full transition-all duration-500"
                        style={{
                          width: j === i ? "24px" : "8px",
                          background: j === i ? "#0aad92" : "rgba(255,255,255,0.15)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Right — copy */}
                <div className="flex flex-col justify-center gap-5 p-10 xl:p-14">
                  <div
                    className="text-xs font-medium tracking-widest uppercase"
                    style={{ color: "#0aad92" }}
                  >
                    {String(i + 1).padStart(2, "0")} / {String(panels.length).padStart(2, "0")}
                  </div>

                  <h3
                    className="font-extrabold text-white"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontSize: "clamp(1.4rem, 3vw, 2rem)",
                      lineHeight: 1.2,
                    }}
                  >
                    {p.headline}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      maxWidth: "420px",
                    }}
                  >
                    {p.body}
                  </p>

                  {/* Divider line */}
                  <div
                    className="h-px w-16 rounded-full"
                    style={{ background: "linear-gradient(90deg, #0aad92, transparent)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom breathing room */}
      <div style={{ height: "5rem" }} />
    </section>
  );
}
