"use client";

import { useEffect, useRef } from "react";

const stats = [
  { value: 500, suffix: "+", label: "Campaigns Launched", desc: "Across social, paid & organic" },
  { value: 3.8, suffix: "×", label: "Average ROAS", desc: "Delivered within 90 days" },
  { value: 12, suffix: "+", label: "Countries Served", desc: "Global clients, local insights" },
  { value: 97, suffix: "%", label: "Client Retention", desc: "Because results speak louder" },
];

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const countersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 75%",
          onEnter: () => {
            if (hasAnimated.current) return;
            hasAnimated.current = true;

            countersRef.current.forEach((el, i) => {
              if (!el) return;
              const target = stats[i].value;
              const isDecimal = target % 1 !== 0;
              gsap.to({ val: 0 }, {
                val: target,
                duration: 2,
                delay: i * 0.15,
                ease: "power2.out",
                onUpdate: function () {
                  if (!el) return;
                  el.textContent = isDecimal
                    ? this.targets()[0].val.toFixed(1)
                    : Math.round(this.targets()[0].val).toString();
                },
              });
            });

            gsap.from(".stat-card", {
              opacity: 0, y: 50, duration: 0.8, stagger: 0.12, ease: "power3.out",
            });
          },
        });

        gsap.from(".stats-label", {
          scrollTrigger: { trigger: ".stats-label", start: "top 90%" },
          immediateRender: false,
          opacity: 0, y: 30, duration: 0.8, ease: "power3.out",
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
      style={{ background: "#f4f1ec" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <div className="stats-label text-center mb-14">
          <span
            className="inline-block text-xs font-medium tracking-widest uppercase mb-4"
            style={{ color: "#085e51" }}
          >
            The Impact
          </span>
          <h2
            className="font-extrabold"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "#111111",
              lineHeight: 1.1,
            }}
          >
            Numbers that tell
            <br />
            the real story.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="stat-card rounded-2xl p-8 flex flex-col gap-2"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(8,94,81,0.1)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <div
                className="font-extrabold flex items-end gap-1 leading-none"
                style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2.5rem,5vw,3.5rem)", color: "#085e51" }}
              >
                <span ref={(el) => { countersRef.current[i] = el; }}>0</span>
                <span>{s.suffix}</span>
              </div>
              <div
                className="font-semibold text-base"
                style={{ color: "#111111" }}
              >
                {s.label}
              </div>
              <div className="text-xs" style={{ color: "#6b7280" }}>
                {s.desc}
              </div>
              {/* Teal accent line */}
              <div
                className="mt-3 h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg, #085e51, #0aad92)", width: "40px" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
