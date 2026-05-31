import InnerPageHero from "@/components/InnerPageHero";
import CaseStudies from "@/components/CaseStudies";
import CTA from "@/components/CTA";

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
