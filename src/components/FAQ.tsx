"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    q: "Do you work with clients from any country?",
    a: "Yes — we work with clients globally. Our team is fully remote and serves brands across Europe, North America, Southeast Asia, the Middle East, and beyond. We adapt to your timezone for calls and check-ins, wherever you are.",
  },
  {
    q: "How quickly can I expect to see results?",
    a: "For paid advertising, clients typically see meaningful results within the first 2–4 weeks as we optimize campaigns. Organic growth through social media and SEO takes 60–90 days to compound. We set clear milestones at every stage so you're never guessing.",
  },
  {
    q: "What does your onboarding process look like?",
    a: "After you book a discovery call and we agree to move forward, onboarding takes 3–5 business days. We gather access to your accounts, run an audit, and deliver your 90-day growth roadmap — then execution starts immediately.",
  },
  {
    q: "Do you offer custom packages or only fixed plans?",
    a: "Everything we do is custom. We don't believe in one-size-fits-all packages. Your budget, your goals, and your market shape the exact services and timeline we recommend. You only pay for what you actually need.",
  },
  {
    q: "How do you handle reporting and communication?",
    a: "Every client gets a shared dashboard with live metrics, weekly written reports, and a monthly strategy call. We're also available via Slack or WhatsApp for quick questions. Transparency is non-negotiable for us.",
  },
  {
    q: "What makes Reach Logic different from other agencies?",
    a: "Most agencies specialise in one channel. We integrate paid ads, organic social, automation, and web — because growth doesn't happen in silos. We also work on performance-aligned terms and are obsessed with your ROI, not just impressions.",
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const elements = [
      headerRef.current,
      ...itemRefs.current.filter(Boolean),
    ].filter(Boolean) as HTMLElement[];

    elements.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = `opacity 0.6s ease ${i * 0.07}s, transform 0.6s ease ${i * 0.07}s`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pad"
      style={{ background: "linear-gradient(180deg, #061a16 0%, #042f28 100%)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-14">
          <span className="inline-block text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "#0aad92" }}>
            FAQ
          </span>
          <h2
            className="font-extrabold text-white"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.1 }}
          >
            Questions you&apos;re
            <br />
            <span className="text-gradient">probably thinking.</span>
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="rounded-2xl overflow-hidden transition-colors duration-300"
              style={{
                background: open === i ? "rgba(8,94,81,0.2)" : "rgba(255,255,255,0.03)",
                border: open === i ? "1px solid rgba(10,173,146,0.3)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                className="w-full text-left px-7 py-5 flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className="font-semibold text-base text-white"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {f.q}
                </span>
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300"
                  style={{
                    background: open === i ? "#0aad92" : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    transform: open === i ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-500"
                style={{ maxHeight: open === i ? "300px" : "0px" }}
              >
                <p
                  className="px-7 pb-6 text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {f.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="text-center mt-12">
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Still have questions?
          </p>
          <a
            href="mailto:hello@reachlogic.co"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-4 transition-all duration-300"
            style={{ color: "#0aad92" }}
          >
            Write to us directly <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
