"use client";

import { useEffect, useRef } from "react";

interface InnerPageHeroProps {
  title: string;
  description?: string;
  tag?: string;
}

export default function InnerPageHero({ title, description, tag }: InnerPageHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gsapCtx: { revert: () => void } | null = null;

    const init = async () => {
      const { gsap } = await import("gsap");

      gsap.set(".hero-tag", { opacity: 0, y: 20 });
      gsap.set(".hero-title-inner", { yPercent: 110 });
      gsap.set(".hero-desc", { opacity: 0, y: 20 });

      const startAnim = () => {
        gsapCtx = gsap.context(() => {
          const tl = gsap.timeline();
          if (tag) {
            tl.to(".hero-tag", { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
          }
          tl.to(
            ".hero-title-inner",
            { yPercent: 0, duration: 0.9, stagger: 0.1, ease: "power4.out" },
            tag ? "-=0.3" : 0
          );
          if (description) {
            tl.to(".hero-desc", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.4");
          }
        }, containerRef);
      };

      startAnim();
    };

    init();
    return () => gsapCtx?.revert();
  }, [title, description, tag]);

  return (
    <section
      ref={containerRef}
      className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #042f28 0%, #061a16 60%, #020f0c 100%)",
      }}
    >
      {/* Background Orbs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(10,173,146,0.15) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {tag && (
          <div className="hero-tag inline-block mb-6">
            <span
              className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
              style={{
                background: "rgba(10,173,146,0.12)",
                border: "1px solid rgba(10,173,146,0.3)",
                color: "#0aad92",
              }}
            >
              {tag}
            </span>
          </div>
        )}

        <h1
          className="font-extrabold leading-tight mb-6 mx-auto"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          }}
        >
          <span className="block overflow-hidden pb-2">
            <span className="hero-title-inner block text-white">{title}</span>
          </span>
        </h1>

        {description && (
          <p
            className="hero-desc text-white/60 mx-auto leading-relaxed"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              maxWidth: "600px",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
