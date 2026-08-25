import type { Metadata } from "next";
import InnerPageHero from "@/components/InnerPageHero";
import Services from "@/components/Services";
import CTA from "@/components/CTA";
import { ServicesJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Our Services — Social Media, Paid Ads, SEO & Web Design",
  description:
    "Explore Reach Logic's full suite of digital growth services: social media management automation, paid advertising, SEO, web design, video production, and organic growth strategy.",
  alternates: { canonical: "https://www.reachlogic.net/services" },
  openGraph: {
    title: "Our Services — Social Media, Paid Ads, SEO & Web Design",
    description:
      "Comprehensive digital growth solutions: social media automation, paid ads, SEO, web design, video production & organic strategy.",
    url: "https://www.reachlogic.net/services",
  },
};

export default function ServicesPage() {
  return (
    <>
      <ServicesJsonLd />
      <InnerPageHero
        title="Our Services"
        description="Comprehensive digital growth solutions tailored to scale your brand."
        tag="What We Do"
      />
      <div className="pt-20">
        <Services />
      </div>
      <CTA />
    </>
  );
}
