"use client";

const services = [
  "Social Media Management",
  "Social Media Marketing",
  "Paid Advertising",
  "Web Design & Development",
  "Digital Growth Strategy",
];

const company = [
  { label: "Our Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  { label: "Instagram", href: "#", icon: "IG" },
  { label: "Facebook", href: "#", icon: "FB" },
  { label: "TikTok", href: "#", icon: "TT" },
  { label: "LinkedIn", href: "#", icon: "LI" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer style={{ background: "#020f0c", borderTop: "1px solid rgba(10,173,146,0.1)" }}>
      {/* Top gradient line */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #085e51, #0aad92, #085e51, transparent)" }} />

      <div className="max-w-7xl mx-auto px-6 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 mb-14">
          {/* Brand */}
          <div className="xl:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white"
                style={{ background: "linear-gradient(135deg,#085e51,#0aad92)" }}
              >
                RL
              </span>
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Reach Logic
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6 max-w-sm"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              We help brands scale smarter through social media management, paid advertising,
              and web design — built to convert globally.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
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
                    onClick={() => scrollTo(c.href)}
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
