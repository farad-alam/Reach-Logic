import InnerPageHero from "@/components/InnerPageHero";
import Services from "@/components/Services";
import CTA from "@/components/CTA";

export default function ServicesPage() {
  return (
    <>
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
