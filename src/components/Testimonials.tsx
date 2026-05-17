"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Sophie Marchand",
    role: "CEO",
    company: "LuxeWear Co.",
    country: "🇫🇷",
    rating: 5,
    quote: "Reach Logic didn't just improve our numbers — they completely transformed how we think about digital. Within 60 days, our ROAS tripled and we finally stopped wasting money on ads that don't convert.",
    avatar: "SM",
  },
  {
    name: "Daniel Osei",
    role: "Head of Marketing",
    company: "Stackr Analytics",
    country: "🇬🇭",
    rating: 5,
    quote: "We went from near-zero LinkedIn presence to 220 qualified leads in 90 days. The thought-leadership content program they built is now our #1 inbound channel. Absolute game-changers.",
    avatar: "DO",
  },
  {
    name: "Priya Nair",
    role: "Founder",
    company: "Urban Brew Roasters",
    country: "🇮🇳",
    rating: 5,
    quote: "I was skeptical — as a small café we had limited budget. But Reach Logic made every dollar count. We were fully booked on weekends within 45 days of working together. Best investment I've made.",
    avatar: "PN",
  },
  {
    name: "Marcus Henriksen",
    role: "Marketing Director",
    company: "NordFit",
    country: "🇸🇪",
    rating: 5,
    quote: "The combination of paid ads expertise and content strategy is rare. Most agencies do one or the other. Reach Logic does both, and they do it exceptionally well. Our CAC dropped 40% in two months.",
    avatar: "MH",
  },
  {
    name: "Aiko Tanaka",
    role: "Co-founder",
    company: "Minimo Tech",
    country: "🇯🇵",
    rating: 5,
    quote: "Communication is always professional and transparent. Weekly reports, instant responses, zero excuses. They delivered exactly what they promised — and then some. Highly recommend.",
    avatar: "AT",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  };

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDot = (i: number) => {
    setActive(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startInterval();
  };

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".test-header", {
          scrollTrigger: { trigger: ".test-header", start: "top 90%" },
          immediateRender: false,
          opacity: 0, y: 40, filter: "blur(10px)", duration: 0.9, ease: "power3.out",
        });
        gsap.from(".test-card", {
          scrollTrigger: { trigger: ".test-card", start: "top 90%" },
          immediateRender: false,
          opacity: 0, y: 50, duration: 1, ease: "power3.out",
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  const t = testimonials[active];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="section-pad"
      style={{ background: "#061a16" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="test-header text-center mb-14">
          <span className="inline-block text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "#0aad92" }}>
            Client Stories
          </span>
          <h2
            className="font-extrabold text-white"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1.1 }}
          >
            Don't take our word.
            <br />
            <span className="text-gradient">Take theirs.</span>
          </h2>
        </div>

        {/* Featured testimonial */}
        <div
          className="test-card rounded-3xl p-10 xl:p-16 mb-8"
          style={{ background: "rgba(8,94,81,0.12)", border: "1px solid rgba(10,173,146,0.15)" }}
        >
          {/* Stars */}
          <div className="flex gap-1 mb-6">
            {Array.from({ length: t.rating }).map((_, i) => (
              <span key={i} style={{ color: "#0aad92", fontSize: "1.2rem" }}>★</span>
            ))}
          </div>

          {/* Quote */}
          <blockquote
            className="text-xl xl:text-2xl font-medium leading-relaxed mb-8 text-white"
            style={{ maxWidth: "800px" }}
          >
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: "linear-gradient(135deg,#085e51,#0aad92)", color: "#fff" }}
            >
              {t.avatar}
            </div>
            <div>
              <div className="font-semibold text-white flex items-center gap-2">
                {t.name} <span>{t.country}</span>
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {t.role} · {t.company}
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: active === i ? "28px" : "8px",
                height: "8px",
                background: active === i ? "#0aad92" : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        {/* Mini cards row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-10">
          {testimonials.map((t, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              className="rounded-xl p-4 text-left transition-all duration-300"
              style={{
                background: active === i ? "rgba(8,94,81,0.3)" : "rgba(255,255,255,0.03)",
                border: active === i ? "1px solid rgba(10,173,146,0.35)" : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="font-semibold text-xs text-white mb-0.5">{t.name}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                {t.company} {t.country}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
