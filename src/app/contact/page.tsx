import type { Metadata } from "next";
import InnerPageHero from "@/components/InnerPageHero";
import FAQ from "@/components/FAQ";
import { ContactJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Contact Us — Book a Free Strategy Call",
  description:
    "Ready to grow? Contact Reach Logic to book a free discovery call. We serve clients across Europe, North America, Southeast Asia, and beyond. Reply within 24 hours.",
  alternates: { canonical: "https://www.reachlogic.net/contact" },
  openGraph: {
    title: "Contact Reach Logic — Book a Free Strategy Call",
    description:
      "Book a free discovery call with Reach Logic. We serve clients globally and reply within 24 hours.",
    url: "https://www.reachlogic.net/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactJsonLd />
      <InnerPageHero
        title="Let's Talk"
        description="Ready to scale? Book a discovery call or send us a message below."
        tag="Contact Us"
        className="pt-28 pb-12 md:pt-32 md:pb-16"
      />

      <section className="px-6 pb-24 md:px-12 md:pb-32 xl:px-0 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[3fr_7fr] gap-12 md:gap-16 pt-4 md:pt-8">
        <div>
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-fraunces)" }}>
            Direct Contact
          </h2>
          <p className="text-white/60 mb-8">
            Prefer to email us directly? Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-[#0aad92] font-semibold uppercase tracking-widest mb-2">Email</div>
              <a href="mailto:hello@reachlogic.net" className="text-xl hover:text-[#0aad92] transition-colors">hello@reachlogic.net</a>
            </div>
            <div>
              <div className="text-xs text-[#0aad92] font-semibold uppercase tracking-widest mb-2">Location</div>
              <address className="text-lg not-italic">
                1st Floor, Afroza Tower,<br />
                Uposhohor Newmarket,<br />
                Rajshahi-6202, Bangladesh
              </address>
            </div>
          </div>
        </div>

        <div className="bg-[#020f0c] p-8 rounded-2xl border border-[rgba(10,173,146,0.1)]">
          <form className="space-y-6" aria-label="Contact form">
            <div>
              <label htmlFor="contact-name" className="block text-sm text-white/60 mb-2">Name*</label>
              <input id="contact-name" type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm text-white/60 mb-2">Email*</label>
              <input id="contact-email" type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="john@example.com" />
            </div>
            <div>
              <label htmlFor="contact-service" className="block text-sm text-white/60 mb-2">Service Interest*</label>
              <select id="contact-service" required defaultValue="" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors appearance-none">
                <option value="" disabled>Select a service</option>
                <option value="social-management">Social Media Management</option>
                <option value="social-marketing">Social Media Marketing</option>
                <option value="ads">Paid Advertising</option>
                <option value="web">Web Design & Development</option>
                <option value="strategy">Organic Growth Strategy</option>
                <option value="video">Video Editing & AI Production</option>
                <option value="seo">Search Engine Optimization (SEO)</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-budget" className="block text-sm text-white/60 mb-2">Your Budget*</label>
              <select id="contact-budget" required defaultValue="" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors appearance-none">
                <option value="" disabled>Select a budget</option>
                <option value="300-500">$300 - $500</option>
                <option value="500-1000">$500 – $1,000</option>
                <option value="1000-3000">$1,000 – $3,000</option>
                <option value="3000+">$3,000+</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-url" className="block text-sm text-white/60 mb-2">Website/Social Media URL</label>
              <input id="contact-url" type="url" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="https://example.com" />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm text-white/60 mb-2">Message*</label>
              <textarea id="contact-message" required rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="Tell us about your goals..."></textarea>
            </div>
            <button type="submit" className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #085e51, #0aad92)" }}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      <FAQ />
    </>
  );
}
