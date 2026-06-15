import type { Metadata } from "next";
import InnerPageHero from "@/components/InnerPageHero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <InnerPageHero 
        title="Privacy Policy" 
        tag="Legal"
      />
      
      <section className="section-pad max-w-3xl mx-auto">
        <div className="text-white/80 space-y-6 leading-relaxed">
          <p>Last updated: January 1, 2026</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>1. Introduction</h2>
          <p>Reach Logic ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>2. The Data We Collect About You</h2>
          <p>Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, email address and telephone numbers.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>3. How We Use Your Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>4. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:hello@reachlogic.co" className="text-[#0aad92] hover:underline">hello@reachlogic.co</a>.</p>
        </div>
      </section>
    </>
  );
}
