import InnerPageHero from "@/components/InnerPageHero";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";

export default function AboutPage() {
  return (
    <>
      <InnerPageHero 
        title="About Reach Logic" 
        description="We are a team of data-driven creatives and growth engineers."
        tag="Our Story"
      />
      <section className="section-pad max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-8" style={{ fontFamily: "var(--font-fraunces)" }}>
          Built for brands ready to dominate.
        </h2>
        <p className="text-white/70 text-lg leading-relaxed mb-12">
          Reach Logic was founded on a simple principle: beautiful design means nothing if it doesn't convert, and traffic means nothing if it isn't qualified. We bridge the gap between aesthetics and performance, delivering award-winning digital experiences backed by rigorous data science.
        </p>
      </section>
      <Stats />
      <Testimonials />
      <CTA />
    </>
  );
}
