import type { Metadata } from "next";
import InnerPageHero from "@/components/InnerPageHero";
import FAQ from "@/components/FAQ";
import { ContactJsonLd } from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";

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
          <ContactForm />
        </div>
      </section>

      <FAQ />
    </>
  );
}
