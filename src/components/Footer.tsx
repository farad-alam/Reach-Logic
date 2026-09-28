"use client";

import { usePathname, useRouter } from "next/navigation";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

declare global {
  interface Window {
    Tawk_API: any;
  }
}

const services = [
  "Social Media Strategy",
  "Social Media Management",
  "Engagement Strategy",
  "Social Media Marketing",
  "Organic Growth Strategy",
  "Paid Advertising",
  "Search Engine Optimization (SEO)",
  "Web Design & Development",
  "Video Editing & AI Production",
];

const company = [
  { label: "Our Work", href: "/work" },
  { label: "Process", href: "/#process" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Case Studies", href: "/work" },
  { label: "FAQs", href: "/#faq" },
  { label: "Career", href: "#" },
  { label: "Contact", href: "/contact" },
];

const legal = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Refund Policy", href: "/refund-policy" },
];

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/reach-logic/", icon: "in" },
  { label: "Facebook", href: "https://www.facebook.com/ReachLogic", icon: "fb" },
  { label: "Instagram", href: "https://www.instagram.com/reachlogicllc", icon: "ig" },
  { label: "TikTok", href: "https://www.tiktok.com/@reachlogic", icon: "tt" },
];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (href: string) => {
    if (href === "#") return;
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

  const handleChatToggle = () => {
    if (typeof window !== "undefined" && window.Tawk_API) {
      window.Tawk_API.toggle();
    }
  };

  return (
    <footer role="contentinfo" style={{ background: "#061311", borderTop: "1px solid rgba(10,173,146,0.1)" }}>
      {/* Top gradient line */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #085e51, #0aad92, #085e51, transparent)" }} />

      <div className="max-w-7xl mx-auto px-6 xl:px-12 py-16">
        
        {/* Reviews Section */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-16 gap-8">
          <div>
            <div className="text-xs font-bold tracking-[0.1em] uppercase mb-3" style={{ color: "#0aad92" }}>
              CLIENT REVIEWS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white max-w-sm leading-tight">
              Rated by the brands we grow
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto">
            {/* Google Review Card */}
            <div className="flex-1 sm:flex-none flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl border" style={{ background: "#0a1917", borderColor: "rgba(255,255,255,0.05)", minWidth: "320px" }}>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 p-2">
                <img src="/google-icon.png" alt="Google" className="w-full h-full object-contain opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-black font-bold text-center leading-tight">Google<br/>logo</span>'; }} />
              </div>
              <div className="flex-1 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="font-bold text-white text-lg mb-1">Google Reviews</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-[#FABC05] text-sm">★★★★★</div>
                  <div className="text-white font-bold text-sm">4.9/5</div>
                </div>
                <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Based on 45 verified reviews</div>
              </div>
              <a href="#" className="text-xs font-semibold hover:underline mt-2 sm:mt-0 whitespace-nowrap self-center sm:self-start" style={{ color: "#0aad92" }}>Read reviews ↗</a>
            </div>

            {/* Trustpilot Review Card */}
            <div className="flex-1 sm:flex-none flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl border" style={{ background: "#0a1917", borderColor: "rgba(255,255,255,0.05)", minWidth: "320px" }}>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 p-2">
                <img src="/trustpilot-icon.png" alt="Trustpilot" className="w-full h-full object-contain opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-black font-bold text-center leading-tight">Trustpilot<br/>logo</span>'; }} />
              </div>
              <div className="flex-1 w-full flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="font-bold text-white text-lg mb-1">Trustpilot Reviews</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-[#00b67a] text-sm">★★★★★</div>
                  <div className="text-white font-bold text-sm">4.9/5</div>
                </div>
                <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Based on 82 verified reviews</div>
              </div>
              <a href="#" className="text-xs font-semibold hover:underline mt-2 sm:mt-0 whitespace-nowrap self-center sm:self-start" style={{ color: "#0aad92" }}>Read reviews ↗</a>
            </div>
          </div>
        </div>

        <div className="w-full h-px mb-16" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 mb-16">
          {/* Brand & Contact */}
          <div>
            <div className="flex items-center mb-6">
              <img
                src="/logo.png"
                alt="Reach Logic"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p
              className="text-sm leading-relaxed mb-8 max-w-sm"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Full-service digital marketing agency helping brands grow smarter online. Strategy, social media, organic growth, SEO, paid ads, and web design, built to convert.
            </p>
            
            <div className="space-y-3 mb-8">
              <a href="mailto:hello@reachlogic.net" className="flex items-center gap-3 text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>
                <Mail size={16} color="#0aad92" /> hello@reachlogic.net
              </a>
              <a href="tel:+8801975646536" className="flex items-center gap-3 text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.6)" }}>
                <Phone size={16} color="#0aad92" /> +880 1975 646536
              </a>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(8,94,81,0.4)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(10,173,146,0.4)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#0aad92";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)";
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
              className="text-xs font-bold tracking-[0.1em] uppercase mb-6"
              style={{ color: "#0aad92" }}
            >
              SERVICES
            </div>
            <ul className="space-y-4">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="/services"
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div
              className="text-xs font-bold tracking-[0.1em] uppercase mb-6"
              style={{ color: "#0aad92" }}
            >
              COMPANY
            </div>
            <ul className="space-y-4">
              {company.map((c) => (
                <li key={c.label}>
                  {c.href === "#" ? (
                    <span className="text-sm cursor-default" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {c.label}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleNavClick(c.href)}
                      className="text-sm transition-colors duration-200 hover:text-white text-left"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {c.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Our Offices */}
          <div>
            <div
              className="text-xs font-bold tracking-[0.1em] uppercase mb-6"
              style={{ color: "#0aad92" }}
            >
              OUR OFFICES
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-3">
                <MapPin size={16} color="#0aad92" className="mt-0.5 shrink-0" />
                <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <strong className="text-white font-semibold block mb-1">Head Office, USA</strong>
                  30 N Gould St Ste R<br />
                  Sheridan, WY 82801<br />
                  United States
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin size={16} color="#0aad92" className="mt-0.5 shrink-0" />
                <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <strong className="text-white font-semibold block mb-1">Operations, Bangladesh</strong>
                  1st Floor, Afroza Tower<br />
                  Uposhohor Newmarket<br />
                  Rajshahi 6202, Bangladesh
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between pt-8 gap-6 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            © 2026 Reach Logic LLC. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <ul className="flex items-center gap-6">
              {legal.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => handleNavClick(l.href)}
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Floating Chat Button */}
      <button 
        onClick={handleChatToggle}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 transition-all duration-300 hover:scale-110"
        style={{ 
          background: "#061311", 
          border: "2px dashed #0aad92",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)" 
        }}
        aria-label="Toggle Chat"
      >
        <MessageSquare size={24} color="#0aad92" />
      </button>
    </footer>
  );
}
