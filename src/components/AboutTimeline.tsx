"use client";

import { useEffect, useRef } from "react";

const milestones = [
  {
    year: "2012",
    title: "The Beginning",
    description:
      "Abul Hasan starts his career as a Social Media Strategist, taking on his first clients and developing the organic growth methods that would define ReachLogic's approach for years to come.",
  },
  {
    year: "2016",
    title: "Expanding the Stack",
    description:
      "SEO, affiliate marketing, blogging, paid advertising, and WordPress are added to the skillset. The foundation of a full-service agency begins to take shape.",
  },
  {
    year: "2021",
    title: "Agency Founded",
    description:
      "Elevate Engage is officially launched as a boutique digital marketing agency. The same year, Abul is honored with the BASIS Outsourcing Award 2021 — district level — recognizing his contribution to Bangladesh's outsourcing and digital industry.",
  },
  {
    year: "2021–2025",
    title: "Team Builds, Services Expand",
    description:
      "A specialist team comes together. The agency scales its service offering, takes on more clients across more industries, and refines the processes that make ReachLogic's results consistent and repeatable.",
  },
  {
    year: "2026",
    title: "ReachLogic is Born",
    description:
      "Elevate Engage is rebranded as ReachLogic to reflect the agency's full-service identity and the strategic thinking at its core. A new brand, a new name, and a clear mission: helping businesses expand their reach, attract the right audience, and drive sustainable growth through smart digital strategy.",
  },
];

export default function AboutTimeline() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(".timeline-item").forEach((item, i) => {
          gsap.from(item, {
            opacity: 0,
            y: 50,
            duration: 0.7,
            delay: i * 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
            },
          });
        });

        gsap.from(".timeline-line-fill", {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-6 py-24 md:px-12 xl:px-0 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <span
          className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4 inline-block"
          style={{
            background: "rgba(10,173,146,0.12)",
            border: "1px solid rgba(10,173,146,0.3)",
            color: "#0aad92",
          }}
        >
          Our Journey
        </span>
        <h2
          className="text-3xl md:text-5xl font-bold text-white mt-4"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          13+ Years in the Making
        </h2>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />
        <div
          className="timeline-line-fill absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-1/2"
          style={{ background: "linear-gradient(to bottom, #0aad92, transparent)" }}
        />

        <div className="space-y-12">
          {milestones.map((m, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={m.year}
                className={`timeline-item relative flex flex-col md:flex-row gap-8 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Card */}
                <div className={`flex-1 ${isEven ? "md:text-right md:pr-12" : "md:pl-12"} pl-14 md:pl-0`}>
                  <div
                    className="inline-block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: "rgba(10,173,146,0.04)",
                      border: "1px solid rgba(10,173,146,0.12)",
                    }}
                  >
                    <div
                      className="text-xs font-bold uppercase tracking-widest mb-2"
                      style={{ color: "#0aad92" }}
                    >
                      {m.year}
                    </div>
                    <h3
                      className="text-xl font-bold text-white mb-3"
                      style={{ fontFamily: "var(--font-fraunces)" }}
                    >
                      {m.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">{m.description}</p>
                  </div>
                </div>

                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 top-6 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[#0aad92] bg-[#020f0c] z-10" />

                {/* Empty spacer for the other side */}
                <div className="hidden md:block flex-1" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
