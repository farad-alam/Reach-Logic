import type { Metadata } from "next";
import InnerPageHero from "@/components/InnerPageHero";
import CaseStudies from "@/components/CaseStudies";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "Our Work — Case Studies & Client Results",
  description:
    "Explore Reach Logic's case studies. Real results for real brands — social growth, paid ad ROAS, SEO wins, and award-level web design projects.",
  alternates: { canonical: "https://www.reachlogic.net/work" },
  openGraph: {
    title: "Our Work — Case Studies & Client Results",
    description:
      "Real results for real brands. Social growth, paid ad ROAS, SEO wins, and web design projects by Reach Logic.",
    url: "https://www.reachlogic.net/work",
  },
};

export default function WorkPage() {
  return (
    <>
      <InnerPageHero
        title="Our Work"
        description="Explore how we've helped brands across the globe achieve exponential growth."
        tag="Case Studies"
      />
      <div className="pt-20">
        <CaseStudies />
      </div>
      <CTA />
    </>
  );
}
