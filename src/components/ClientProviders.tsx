"use client";

import { useEffect, useState } from "react";
import CustomCursor from "./CustomCursor";
import Preloader from "./Preloader";
import ScrollProgress from "./ScrollProgress";

function isMobileOrTouch() {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth < 768 ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

export default function ClientProviders() {
  // On mobile, skip the preloader entirely — it blocks LCP measurement
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = isMobileOrTouch();
    setIsMobile(mobile);

    if (mobile) {
      // On mobile: skip preloader, fire ready event immediately
      (window as never as Record<string, unknown>).__rlReady = true;
      window.dispatchEvent(new CustomEvent("reachlogic:ready"));
      setPreloaderDone(true);
      return;
    }

    // On desktop: lock scroll while preloader is active
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleComplete = () => {
    document.body.style.overflow = "";
    setPreloaderDone(true);
    (window as never as Record<string, unknown>).__rlReady = true;
    window.dispatchEvent(new CustomEvent("reachlogic:ready"));
  };

  return (
    <>
      {/* Custom cursor — desktop only */}
      {!isMobile && <CustomCursor />}
      <ScrollProgress />

      {/* Grain overlay — desktop only (hidden via CSS on mobile) */}
      <div
        className="grain-overlay"
        aria-hidden="true"
      />

      {/* Preloader — desktop only, unmounts after animation completes */}
      {!isMobile && !preloaderDone && <Preloader onComplete={handleComplete} />}
    </>
  );
}
