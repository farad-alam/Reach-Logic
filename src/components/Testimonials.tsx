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

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startInterval();
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
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
        gsap.from(".test-content", {
          scrollTrigger: { trigger: ".test-content", start: "top 80%" },
          immediateRender: false,
          opacity: 0, y: 30, duration: 1, ease: "power3.out",
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
      className="py-24 md:py-32"
      style={{ background: "#061a16" }}
    >
      <div className="max-w-7xl mx-auto px-6 relative flex flex-col items-center justify-center min-h-[450px] test-content">
        
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 z-10"
          style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}
          aria-label="Previous testimonial"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 z-10"
          style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}
          aria-label="Next testimonial"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center max-w-4xl px-8 md:px-16" key={active}>
          {/* Quote Icon */}
          <div className="mb-8">
            <svg width="48" height="36" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "rgba(10,173,146,0.25)" }}>
              <path d="M15.4839 0V11.6129C15.4839 19.498 10.4357 26.6853 0 30L3.10977 17.581C7.03714 16.6343 9.67742 13.9234 9.67742 11.6129V0H15.4839ZM39.6774 0V11.6129C39.6774 19.498 34.6291 26.6853 24.1935 30L27.3033 17.581C31.2307 16.6343 33.871 13.9234 33.871 11.6129V0H39.6774Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Stars */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: t.rating }).map((_, i) => (
              <svg key={i} className="w-5 h-5" style={{ color: "#0aad92" }} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Quote Text */}
          <blockquote
            className="text-2xl md:text-3xl xl:text-4xl font-medium leading-snug md:leading-snug mb-12 text-white italic"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Author */}
          <div className="flex items-center justify-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: "linear-gradient(135deg,#085e51,#0aad92)", color: "#fff" }}
            >
              {t.avatar}
            </div>
            <div className="text-left flex flex-col justify-center">
              <div className="font-semibold text-white text-base flex items-center gap-2">
                {t.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
