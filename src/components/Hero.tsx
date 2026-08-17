"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferAttribute } from "three";

// Detect mobile / touch devices once at module level
function isMobile() {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth < 768 ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Three.js wave background — DESKTOP ONLY ────────── */
  useEffect(() => {
    if (isMobile()) return; // Skip entirely on mobile — saves ~14,000 ms TBT

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: (() => void) | null = null;

    const init = async () => {
      try {
        const THREE = await import("three");

        const W = window.innerWidth;
        const H = window.innerHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
        camera.position.set(0, 4.5, 7);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: false, // Disable on desktop too for perf
          alpha: true,
          powerPreference: "low-power",
        });
        renderer.setSize(W, H);
        renderer.setPixelRatio(1); // Force 1x pixel ratio to reduce GPU load
        renderer.setClearColor(0x000000, 0);

        /* ── Wave mesh — reduced from 80×80 to 40×40 ── */
        const geo = new THREE.PlaneGeometry(18, 18, 40, 40);
        geo.rotateX(-Math.PI / 2);

        const mat = new THREE.PointsMaterial({
          color: 0x0aad92,
          size: 0.075,
          transparent: true,
          opacity: 0.42,
          sizeAttenuation: true,
        });

        const wave = new THREE.Points(geo, mat);
        scene.add(wave);

        /* ── Floating spark particles — reduced from 250 to 120 ── */
        const sparkCount = 120;
        const sparkPositions = new Float32Array(sparkCount * 3);
        for (let i = 0; i < sparkCount; i++) {
          sparkPositions[i * 3 + 0] = (Math.random() - 0.5) * 22;
          sparkPositions[i * 3 + 1] = Math.random() * 4 + 0.5;
          sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 22;
        }
        const sparkGeo = new THREE.BufferGeometry();
        sparkGeo.setAttribute(
          "position",
          new THREE.BufferAttribute(sparkPositions, 3)
        );
        const sparkMat = new THREE.PointsMaterial({
          color: 0x5eead4,
          size: 0.07,
          transparent: true,
          opacity: 0.5,
          sizeAttenuation: true,
        });
        const sparks = new THREE.Points(sparkGeo, sparkMat);
        scene.add(sparks);

        /* ── Mouse tracking ── */
        let mouseX = 0;
        let mouseY = 0;
        const onMouseMove = (e: MouseEvent) => {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
          mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMouseMove);

        /* ── Animation loop ── */
        let time = 0;
        let raf: number;
        const positions = geo.attributes.position as BufferAttribute;

        const animate = () => {
          raf = requestAnimationFrame(animate);
          time += 0.007;

          for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const y =
              Math.sin(x * 0.5 + time) * 0.38 +
              Math.cos(z * 0.4 + time * 0.75) * 0.3 +
              Math.sin((x + z) * 0.3 + time * 0.5) * 0.15;
            positions.setY(i, y);
          }
          positions.needsUpdate = true;

          camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.018;
          camera.position.y += (4.5 + mouseY * 0.4 - camera.position.y) * 0.018;
          camera.lookAt(0, 0, 0);

          sparks.rotation.y = time * 0.06;

          renderer.render(scene, camera);
        };
        animate();

        /* ── Resize handling ── */
        const onResize = () => {
          const W = window.innerWidth;
          const H = window.innerHeight;
          camera.aspect = W / H;
          camera.updateProjectionMatrix();
          renderer.setSize(W, H);
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
          geo.dispose();
          mat.dispose();
          sparkGeo.dispose();
          sparkMat.dispose();
        };
      } catch {
        // Silently fall back if Three.js fails (old browser, etc.)
      }
    };

    // Use requestIdleCallback so Three.js doesn't block initial paint
    if ("requestIdleCallback" in window) {
      const id = (window as Window & { requestIdleCallback: (cb: () => void, opts?: object) => number })
        .requestIdleCallback(init, { timeout: 2000 });
      return () => {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
        cleanup?.();
      };
    } else {
      const t = setTimeout(init, 200);
      return () => {
        clearTimeout(t);
        cleanup?.();
      };
    }
  }, []);

  /* ── Magnetic CTA buttons — DESKTOP ONLY ────────────── */
  useEffect(() => {
    if (isMobile()) return; // Skip on mobile — saves GSAP chunk evaluation

    let cleanup: (() => void) | null = null;

    const init = async () => {
      const { gsap } = await import("gsap");

      const buttons = document.querySelectorAll<HTMLElement>(".magnetic-btn");
      const handlers: Array<() => void> = [];

      buttons.forEach((btn) => {
        const onEnter = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          gsap.to(btn, { x: (e.clientX - cx) * 0.22, y: (e.clientY - cy) * 0.22, duration: 0.4, ease: "power2.out" });
        };
        const onMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          gsap.to(btn, { x: (e.clientX - cx) * 0.22, y: (e.clientY - cy) * 0.22, duration: 0.35, ease: "power2.out" });
        };
        const onLeave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        };

        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave);
        handlers.push(() => {
          btn.removeEventListener("mouseenter", onEnter);
          btn.removeEventListener("mousemove", onMove);
          btn.removeEventListener("mouseleave", onLeave);
        });
      });

      cleanup = () => handlers.forEach((fn) => fn());
    };

    init();
    return () => cleanup?.();
  }, []);

  /* ── GSAP hero entrance ──────────────────────────────── */
  useEffect(() => {
    let gsapCtx: { revert: () => void } | null = null;

    const init = async () => {
      const { gsap } = await import("gsap");

      gsap.set(".hero-chip", { opacity: 0, y: 24 });
      gsap.set(".hero-line-inner", { yPercent: 110 });
      gsap.set(".hero-sub", { opacity: 0, y: 28 });
      gsap.set(".hero-ctas", { opacity: 0, y: 20 });
      gsap.set(".hero-scroll", { opacity: 0 });

      const startAnim = () => {
        gsapCtx = gsap.context(() => {
          const tl = gsap.timeline();
          tl.to(".hero-chip", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
            .to(".hero-line-inner", { yPercent: 0, duration: 1.05, stagger: 0.14, ease: "power4.out" }, "-=0.35")
            .to(".hero-sub", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.55")
            .to(".hero-ctas", { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }, "-=0.5")
            .to(".hero-scroll", { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.3");
        }, containerRef);
      };

      if ((window as never as Record<string, unknown>).__rlReady) {
        startAnim();
      } else {
        window.addEventListener("reachlogic:ready", startAnim, { once: true });
        const fallback = setTimeout(() => {
          if (!(window as never as Record<string, unknown>).__rlReady) startAnim();
        }, 4000);
        return () => clearTimeout(fallback);
      }
    };

    init();
    return () => { gsapCtx?.revert(); };
  }, []);

  /* ── Cycling words ───────────────────────────────────── */
  const words = ["Logically.", "Organically.", "Strategically."];
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % words.length);
        setWordVisible(true);
      }, 700);
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #042f28 0%, #061a16 60%, #020f0c 100%)",
      }}
    >
      {/* Three.js canvas — hidden on mobile via CSS, only initialised on desktop */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full hidden md:block"
        style={{ opacity: 0.85 }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 35%, rgba(4,47,40,0.7) 70%, #042f28 100%)",
        }}
      />

      {/* Glowing orb — top */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(circle, rgba(8,94,81,0.22) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      {/* Glowing orb — bottom right */}
      <div
        className="absolute bottom-0 right-0 rounded-full pointer-events-none"
        style={{
          width: "450px",
          height: "450px",
          background:
            "radial-gradient(circle, rgba(10,173,146,0.09) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        {/* Eyebrow chip */}
        <div
          className="hero-chip inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{
            background: "rgba(10,173,146,0.1)",
            border: "1px solid rgba(10,173,146,0.25)",
            color: "#0aad92",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#0aad92", boxShadow: "0 0 6px #0aad92" }}
          />
          Full-Service Digital Growth Agency
        </div>

        {/* Headline */}
        <h1
          className="font-extrabold leading-tight mb-6"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "clamp(2rem, 5.5vw, 5.5rem)",
          }}
        >
          <span className="hero-clip block" style={{ color: "#ffffff" }}>
            <span className="hero-line-inner" style={{ display: "block" }}>
              Strategy That Moves
            </span>
          </span>
          <span className="hero-clip block" style={{ color: "#ffffff" }}>
            <span className="hero-line-inner" style={{ display: "block" }}>
              Brands Forward.
            </span>
          </span>
        </h1>

        {/* Cycling tagline */}
        <div className="hero-sub mb-10 flex flex-col items-center gap-1">
          <span
            className="text-white/45"
            style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", letterSpacing: "0.01em" }}
          >
            Reach Your Right Audience
          </span>
          <div className="overflow-hidden">
            <span
              className="block font-extrabold text-gradient"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontSize: "clamp(1.5rem, 3.5vw, 3rem)",
                lineHeight: 1.1,
                paddingBottom: "0.2em",
                marginBottom: "-0.2em",
                transform: wordVisible ? "translateY(0%)" : "translateY(-100%)",
                opacity: wordVisible ? 1 : 0,
                transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease",
                display: "block",
                willChange: "transform, opacity",
              }}
            >
              {words[wordIndex]}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="magnetic-btn group relative px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 pulse-glow"
            style={{
              background: "linear-gradient(135deg, #085e51, #0aad92)",
              minWidth: "210px",
              fontSize: "0.95rem",
            }}
          >
            Book Free Strategy Call
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#work"
            className="magnetic-btn px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-white/10"
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
        <span className="text-xs text-white/30 tracking-widest uppercase">
          Scroll
        </span>
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
