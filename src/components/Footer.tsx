"use client";

import { usePathname, useRouter } from "next/navigation";

const services = [
  "Social Media Management",
  "Social Media Marketing",
  "Paid Advertising",
  "Web Design & Development",
  "Organic Growth Strategy",
  "Video Editing & AI Production",
  "Search Engine Optimization (SEO)",
];

const company = [
  { label: "Our Work", href: "/work" },
  { label: "Process", href: "/#process" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legal = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/reach-logic/", icon: "LI" },
  { label: "Facebook", href: "https://www.facebook.com/ReachLogic", icon: "FB" },
  { label: "Instagram", href: "https://www.instagram.com/reach.logic", icon: "IG" },
];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      const hash = href.substring(1);
      if (pathname === "/") {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(href);
      }
    } else {
      router.push(href);
    }
  };

  return (
    <footer style={{ background: "#020f0c", borderTop: "1px solid rgba(10,173,146,0.1)" }}>
      {/* Top gradient line */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #085e51, #0aad92, #085e51, transparent)" }} />

      <div className="max-w-7xl mx-auto px-6 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 mb-14">
          {/* Brand */}
          <div className="xl:col-span-2">
            <div className="flex items-center mb-5">
              <img
                src="/logo.png"
                alt="Reach Logic"
                className="h-9 w-auto object-contain"
              />
            </div>
            <p
              className="text-sm leading-relaxed mb-6 max-w-sm"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Full-service digital marketing agency helping brands grow smarter online. Strategy, social media, organic growth, SEO, paid ads, and web design — built to convert.
            </p>
            {/* Socials */}
            <div className="flex gap-3 mb-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(8,94,81,0.4)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,173,146,0.4)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#0aad92";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
            {/* Address */}
            <div className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              1st Floor, Afroza Tower,<br />
              Uposhohor Newmarket,<br />
              Rajshahi-6202, Bangladesh
            </div>
          </div>

          {/* Services */}
          <div>
            <div
              className="text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ color: "#0aad92" }}
            >
              Services
            </div>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <span
                    className="text-sm transition-colors duration-200 cursor-default"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div
              className="text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ color: "#0aad92" }}
            >
              Company
            </div>
            <ul className="space-y-3">
              {company.map((c) => (
                <li key={c.label}>
                  <button
                    onClick={() => handleNavClick(c.href)}
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <div className="mt-8">
              <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#0aad92" }}>
                Contact
              </div>
              <a
                href="mailto:hello@reachlogic.co"
                className="text-sm hover:text-white transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                hello@reachlogic.co
              </a>
            </div>

            {/* Legal */}
            <div className="mt-8">
              <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#0aad92" }}>
                Legal
              </div>
              <ul className="space-y-3">
                {legal.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => handleNavClick(l.href)}
                      className="text-sm transition-colors duration-200 hover:text-white"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2026 Reach Logic. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            Scale Smarter. Reach Further.
          </p>
        </div>
      </div>
    </footer>
  );
}
