"use client";

import { useEffect, useState } from "react";
import CustomCursor from "./CustomCursor";
import Preloader from "./Preloader";
import ScrollProgress from "./ScrollProgress";

export default function ClientProviders() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  // Lock scroll while preloader is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleComplete = () => {
    document.body.style.overflow = "";
    setPreloaderDone(true);
    // Signal hero (and any other components) that the page is ready
    (window as never as Record<string, unknown>).__rlReady = true;
    window.dispatchEvent(new CustomEvent("reachlogic:ready"));
  };

  return (
    <>
      <CustomCursor />
      <ScrollProgress />

      {/* Animated film grain overlay */}
      <div
        className="grain-overlay"
        aria-hidden="true"
      />

      {/* Preloader — unmounts after animation completes */}
      {!preloaderDone && <Preloader onComplete={handleComplete} />}
    </>
  );
}
