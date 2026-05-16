"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", onMouseMove);

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      r: number; alpha: number;
    }

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.vx -= (dx / dist) * 0.02;
          p.vy -= (dy / dist) * 0.02;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10,173,146,${p.alpha})`;
        ctx.fill();
      });

      /* Draw lines between close particles */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(10,173,146,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  /* ── GSAP hero animations ── */
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ delay: 0.2 });
        tl.from(".hero-chip", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" })
          .from(".hero-h1 span", { opacity: 0, y: 60, duration: 0.9, stagger: 0.12, ease: "power3.out" }, "-=0.3")
          .from(".hero-sub", { opacity: 0, y: 30, duration: 0.7, ease: "power3.out" }, "-=0.4")
          .from(".hero-ctas", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" }, "-=0.4")
          .from(".hero-scroll", { opacity: 0, duration: 0.5 }, "-=0.2");
      }, containerRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #042f28 0%, #061a16 60%, #020f0c 100%)" }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.7 }}
      />

      {/* Glowing orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(8,94,81,0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 rounded-full pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(10,173,146,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Chip */}
        <div className="hero-chip inline-flex items-center gap-2 mb-8">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{
              background: "rgba(10,173,146,0.12)",
              border: "1px solid rgba(10,173,146,0.3)",
              color: "#0aad92",
            }}
          >
            Global Digital Agency
          </span>
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
            style={{
              background: "rgba(10,173,146,0.12)",
              border: "1px solid rgba(10,173,146,0.3)",
              color: "#0aad92",
            }}
          >
            Results-Driven Growth
          </span>
        </div>

        {/* Headline */}
        <h1
          className="hero-h1 font-extrabold leading-none mb-6"
          style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(3rem, 8vw, 7rem)" }}
        >
          <span className="block text-white">Scale Smarter.</span>
          <span className="block text-gradient">Reach Further.</span>
        </h1>

        {/* Sub */}
        <p
          className="hero-sub text-white/60 mb-10 mx-auto leading-relaxed"
          style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", maxWidth: "560px" }}
        >
          Social automation, paid advertising, and web design — built for brands
          ready to dominate the digital world.
        </p>

        {/* CTAs */}
        <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="group relative px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 pulse-glow"
            style={{
              background: "linear-gradient(135deg, #085e51, #0aad92)",
              minWidth: "200px",
              fontSize: "0.95rem",
            }}
          >
            Book Free Strategy Call
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#work"
            className="px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-white/10"
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)",
              minWidth: "200px",
              fontSize: "0.95rem",
            }}
          >
            See Our Work
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-white/30 tracking-widest uppercase">Scroll</span>
        <div
          className="w-px h-12 relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              height: "40%",
              background: "linear-gradient(to bottom, #0aad92, transparent)",
              animation: "scrollLine 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(300%); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
