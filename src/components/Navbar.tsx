"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const links = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Active section tracker ─────────────────────── */
  useEffect(() => {
    const sectionIds = links.map((l) => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(4, 47, 40, 0.85)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(10,173,146,0.15)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 xl:px-12 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #085e51, #0aad92)" }}
            >
              RL
            </span>
            <span
              className="text-white font-bold text-lg tracking-tight"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Reach Logic
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {links.map((l) => {
              const isActive = activeSection === l.href.replace("#", "");
              return (
                <li key={l.label}>
                  <button
                    onClick={() => handleNavClick(l.href)}
                    className="nav-link text-sm transition-colors duration-300 tracking-wide relative"
                    style={{ color: isActive ? "#0aad92" : "rgba(255,255,255,0.65)" }}
                  >
                    {l.label}
                    {/* Active dot */}
                    <span
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? "4px" : "0px",
                        height: isActive ? "4px" : "0px",
                        background: "#0aad92",
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <div className="hidden md:block">
            <button
              onClick={() => handleNavClick("#contact")}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #085e51, #0aad92)",
                color: "#fff",
                boxShadow: "0 0 20px rgba(10,173,146,0.3)",
              }}
            >
              Book a Call
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className="block h-0.5 bg-white transition-all duration-300"
              style={{
                width: "24px",
                transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
              }}
            />
            <span
              className="block h-0.5 bg-white transition-all duration-300"
              style={{ width: "24px", opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-0.5 bg-white transition-all duration-300"
              style={{
                width: "24px",
                transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500"
        style={{
          background: "rgba(4, 47, 40, 0.97)",
          backdropFilter: "blur(20px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
        }}
      >
        {links.map((l, i) => (
          <button
            key={l.label}
            onClick={() => handleNavClick(l.href)}
            className="text-3xl font-bold text-white/80 hover:text-white transition-colors"
            style={{
              fontFamily: "var(--font-fraunces)",
              transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              transition: `transform 0.4s ease ${i * 0.06}s, opacity 0.4s ease ${i * 0.06}s`,
              opacity: menuOpen ? 1 : 0,
            }}
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={() => handleNavClick("#contact")}
          className="mt-4 px-8 py-3 rounded-full text-base font-semibold"
          style={{ background: "linear-gradient(135deg, #085e51, #0aad92)", color: "#fff" }}
        >
          Book a Call
        </button>
      </div>
    </>
  );
}
