"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Show cursors (hidden by default via CSS)
    dot.style.opacity = "1";
    ring.style.opacity = "1";

    // Hide native cursor globally
    document.documentElement.style.cursor = "none";

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
    };

    // Ring follows with smooth lag
    const loop = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      ring.style.transform = `translate(${Math.round(ringX - 18)}px, ${Math.round(ringY - 18)}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    // Hover effects on interactive elements
    const expand = () => {
      ring.style.width = "64px";
      ring.style.height = "64px";
      ring.style.borderColor = "#0aad92";
      ring.style.background = "rgba(10,173,146,0.08)";
      dot.style.transform += " scale(0)";
      dot.style.opacity = "0";
    };
    const collapse = () => {
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.borderColor = "rgba(255,255,255,0.35)";
      ring.style.background = "transparent";
      dot.style.opacity = "1";
    };

    // Attach to all interactive elements (and watch for new ones)
    const attach = () => {
      document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        (el as HTMLElement).style.cursor = "none";
        el.removeEventListener("mouseenter", expand);
        el.removeEventListener("mouseleave", collapse);
        el.addEventListener("mouseenter", expand);
        el.addEventListener("mouseleave", collapse);
      });
    };
    attach();

    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#0aad92",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: 0,
          willChange: "transform",
          transition: "opacity 0.2s ease",
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.35)",
          background: "transparent",
          pointerEvents: "none",
          zIndex: 99998,
          opacity: 0,
          willChange: "transform",
          transition:
            "width 0.25s ease, height 0.25s ease, border-color 0.25s ease, background 0.25s ease, opacity 0.3s ease",
        }}
      />
    </>
  );
}
