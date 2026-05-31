import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Problem from "@/components/Problem";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import CaseStudies from "@/components/CaseStudies";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Problem />
      <Services />
      <Stats />
      <CaseStudies />
      <Process />
      <Testimonials />
      <CTA />
      <FAQ />
    </>
  );
}
