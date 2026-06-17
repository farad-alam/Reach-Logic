"use client";

import { useEffect, useRef } from "react";

const team = [
  {
    name: "Abul Hasan",
    title: "CEO & Founder",
    experience: "13+ Years Experience",
    skills: "Social Media & SEO",
    initials: "AH",
    imageSrc: "/images/abul-hasan.jpg",
    imagePosition: "center 15%",
  },
  {
    name: "Iqbal Bari Shuvo",
    title: "Head of Development",
    experience: "13+ Years Experience",
    skills: "PHP, JavaScript, Ruby",
    initials: "IB",
    imageSrc: null as string | null,
    imagePosition: "center",
  },
  {
    name: "Kazi Abdullah Al Maruf",
    title: "Head of Paid Ads",
    experience: "7+ Years Experience",
    skills: "Google & Social Media Ads",
    initials: "KA",
    imageSrc: "/images/kazi-maruf.jpg",
    imagePosition: "center 15%",
  },
  {
    name: "Mizanur Rahman",
    title: "Head of SEO",
    experience: "11+ Years Experience",
    skills: "SEO & Affiliate Marketing",
    initials: "MR",
    imageSrc: "/images/mizanur-rahman.jpg",
    imagePosition: "center 10%",
  },
  {
    name: "Farad Alam Foisal",
    title: "Senior Web Developer",
    experience: "5+ Years of Experience",
    skills: "Ai, Python, React, Next.js",
    initials: "FF",
    imageSrc: null as string | null,
    imagePosition: "center",
  },
  {
    name: "Nahid Aktar",
    title: "Senior Social Media Manager",
    experience: "Several Years of Experience",
    skills: "Social Media Strategy",
    initials: "NA",
    imageSrc: null as string | null,
    imagePosition: "center",
  },
];

export default function AboutTeam() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const cards = sectionRef.current?.querySelectorAll(".team-card");
      if (!cards || cards.length === 0) return;

      // Set initial invisible state right before animating
      gsap.set(cards, { opacity: 0, y: 40 });

      ctx = gsap.context(() => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-6 py-24 md:px-12 xl:px-0 max-w-6xl mx-auto">
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
          Our People
        </span>
        <h2
          className="text-3xl md:text-5xl font-bold text-white mt-4"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          The Leadership Team
        </h2>
        <p className="text-white/50 mt-4 max-w-xl mx-auto text-base">
          Specialists, not generalists. Every head of department brings deep expertise and a track record of results.
        </p>
      </div>

      {/* Team Grid */}
      <div className="team-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div
            key={member.name}
            className="team-card group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
            style={{
              background: "rgba(10,173,146,0.04)",
              border: "1px solid rgba(10,173,146,0.1)",
            }}
          >
            {/* Top photo area */}
            <div
              className="relative w-full h-80 flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(10,173,146,0.15) 0%, rgba(6,26,22,0.8) 100%)",
              }}
            >
              {member.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.imageSrc}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: member.imagePosition }}
                />
              ) : (
                /* Initials avatar placeholder */
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #085e51, #0aad92)",
                    }}
                  >
                    {member.initials}
                  </div>
                </div>
              )}

              {/* Hover glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at center, rgba(10,173,146,0.12) 0%, transparent 70%)",
                }}
              />
            </div>

            {/* Card body */}
            <div className="p-6">
              <h3
                className="text-lg font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {member.name}
              </h3>
              <p className="text-[#0aad92] text-sm font-medium mb-3">{member.title}</p>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{member.experience}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40 text-xs mt-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
                <span>{member.skills}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
