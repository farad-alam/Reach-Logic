"use client";

import { useEffect, useRef, useState } from "react";

const services = [
  {
    icon: "⚡",
    title: "Social Media Management Automation",
    short: "Put your social presence on autopilot without losing authenticity.",
    detail: "AI-powered scheduling, smart content repurposing, and analytics dashboards that free your team to focus on strategy — not repetitive tasks.",
    metric: "4× faster content output",
    tag: "Automation",
  },
  {
    icon: "📣",
    title: "Social Media Marketing",
    short: "Build audiences that actually buy — not just follow.",
    detail: "Platform-native strategies for Instagram, Facebook, TikTok, and LinkedIn. We grow communities that convert through data-informed content and community management.",
    metric: "+240% avg. organic reach",
    tag: "Growth",
  },
  {
    icon: "🎯",
    title: "Paid Advertising",
    short: "Every dollar earns its place. No waste, only ROI.",
    detail: "High-performance campaigns across Facebook, TikTok, and Google. We own the full funnel — creative, targeting, A/B testing, and optimization — all in-house.",
    metric: "3.8× average ROAS",
    tag: "Performance",
  },
  {
    icon: "💻",
    title: "Web Design & Development",
    short: "Sites that don't just look good — they convert.",
    detail: "Award-caliber design paired with clean, fast code. We build custom websites, landing pages, and e-commerce experiences that load fast, rank well, and sell hard.",
    metric: "+65% avg. conversion lift",
    tag: "Development",
  },
  {
    icon: "📈",
    title: "Digital Growth Strategy",
    short: "No generic playbooks. Your growth, your roadmap.",
    detail: "We audit your current digital ecosystem, identify the highest-leverage opportunities, and build a custom 90-day growth plan — then execute it with you, not for you.",
    metric: "90-day custom roadmap",
    tag: "Strategy",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  /* ── Scroll reveal ──────────────────────────────── */
  useEffect(() => {
    const elements = [
      headerRef.current,
      ...cardRefs.current.filter(Boolean),
    ].filter(Boolean) as Element[];

    elements.forEach((el, i) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(50px)";
      (el as HTMLElement).style.filter = "blur(10px)";
      (el as HTMLElement).style.transition = `opacity 0.75s ease ${i * 0.08}s, transform 0.75s ease ${i * 0.08}s, filter 0.75s ease ${i * 0.08}s`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            (entry.target as HTMLElement).style.filter = "blur(0px)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── 3D tilt on service cards ───────────────────── */
  useEffect(() => {
    const cards = cardRefs.current.slice(0, services.length);
    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      if (!card) return;

      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        const rotY = x * 9;
        const rotX = -y * 6;
        card.style.transform = `perspective(900px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(-4px) scale(1.01)`;
        card.style.transition = "transform 0.12s ease";
      };

      const onLeave = () => {
        card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)";
        card.style.transition = "transform 0.55s cubic-bezier(0.23,1,0.32,1)";
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="section-pad"
      style={{ background: "#061a16" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <span
              className="inline-block text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: "#0aad92" }}
            >
              What We Do
            </span>
            <h2
              className="font-extrabold text-white"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
            >
              Every service, one goal:
              <br />
              <span className="text-gradient">your growth.</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            We don't offer packages. We build custom solutions around your brand, audience, and ambitions.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="group relative rounded-2xl p-8 cursor-default overflow-hidden transition-all duration-500"
              style={{
                background: hovered === i
                  ? "rgba(8,94,81,0.3)"
                  : "rgba(255,255,255,0.03)",
                border: hovered === i
                  ? "1px solid rgba(10,173,146,0.4)"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: hovered === i ? "0 20px 60px rgba(10,173,146,0.12)" : "none",
                transformStyle: "preserve-3d",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl transition-opacity duration-500"
                style={{
                  background: "radial-gradient(ellipse at top left, rgba(10,173,146,0.08), transparent 60%)",
                  opacity: hovered === i ? 1 : 0,
                }}
              />

              <div className="relative z-10 flex flex-col gap-4 h-full">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{s.icon}</span>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: "rgba(10,173,146,0.12)",
                      color: "#0aad92",
                      border: "1px solid rgba(10,173,146,0.2)",
                    }}
                  >
                    {s.tag}
                  </span>
                </div>

                <h3
                  className="font-bold text-white text-lg leading-snug"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {s.title}
                </h3>

                <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {hovered === i ? s.detail : s.short}
                </p>

                {/* Metric */}
                <div
                  className="flex items-center gap-2 mt-2 transition-all duration-300"
                  style={{ opacity: hovered === i ? 1 : 0.4 }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#0aad92" }}
                  />
                  <span className="text-xs font-semibold" style={{ color: "#0aad92" }}>
                    {s.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div
            ref={(el) => { cardRefs.current[services.length] = el; }}
            className="rounded-2xl p-8 flex flex-col items-start justify-end"
            style={{
              background: "linear-gradient(135deg, #085e51 0%, #0aad92 100%)",
              minHeight: "280px",
            }}
          >
            <p className="text-xs font-medium tracking-widest uppercase mb-3 text-white/60">
              Not sure where to start?
            </p>
            <h3
              className="text-2xl font-bold text-white mb-5"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Let's build your custom growth plan.
            </h3>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:gap-4"
              style={{ color: "#085e51" }}
            >
              Get Started <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
