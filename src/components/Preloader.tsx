"use client";

import { useEffect, useRef, useState } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [exit, setExit] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    let current = 0;
    let frameId: number;

    const step = () => {
      if (completedRef.current) return;

      // Ease-in-out curve: fast start, slow finish
      const progress = current / 100;
      const speed = progress < 0.6
        ? Math.random() * 6 + 2
        : progress < 0.85
        ? Math.random() * 3 + 1
        : Math.random() * 1.2 + 0.4;

      current = Math.min(current + speed, 100);
      setCount(Math.floor(current));

      if (current >= 100) {
        completedRef.current = true;
        setTimeout(() => {
          setExit(true);
          setTimeout(() => {
            onComplete();
          }, 850);
        }, 250);
        return;
      }

      const delay = progress < 0.6 ? 28 : progress < 0.85 ? 55 : 95;
      frameId = window.setTimeout(step, delay);
    };

    step();
    return () => clearTimeout(frameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply exit animation imperatively to avoid transition timing issues
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (exit) {
      // Force reflow then apply transition
      panel.style.transition = "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)";
      panel.style.transform = "translateY(-105%)";
    }
  }, [exit]);

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "#042f28",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        willChange: "transform",
      }}
    >
      {/* Large counter */}
      <div
        style={{
          fontFamily: "var(--font-fraunces)",
          fontSize: "clamp(7rem, 20vw, 16rem)",
          fontWeight: 900,
          color: "#ffffff",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: exit ? 0 : 1,
          transform: exit ? "translateY(-20px)" : "translateY(0)",
          userSelect: "none",
        }}
      >
        {String(count).padStart(2, "0")}
      </div>

      {/* Brand label */}
      <div
        style={{
          marginTop: "1.5rem",
          color: "#0aad92",
          fontSize: "0.68rem",
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          fontWeight: 500,
          opacity: exit ? 0 : 0.65,
          transition: "opacity 0.3s ease 0.05s",
          userSelect: "none",
        }}
      >
        Reach Logic
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          width: `${count}%`,
          background: "linear-gradient(90deg, #085e51, #0aad92)",
          transition: "width 0.08s linear",
        }}
      />

      {/* Corner label */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
          userSelect: "none",
        }}
      >
        Loading experience
      </div>
    </div>
  );
}
