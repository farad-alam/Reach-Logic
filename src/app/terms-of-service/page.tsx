import type { Metadata } from "next";
import InnerPageHero from "@/components/InnerPageHero";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false, follow: false },
};


export default function TermsOfServicePage() {
  return (
    <>
      <InnerPageHero 
        title="Terms of Service" 
        tag="Legal"
      />
      
      <section className="section-pad max-w-3xl mx-auto">
        <div className="text-white/80 space-y-6 leading-relaxed">
          <p>Last updated: January 1, 2026</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>1. Agreement to Terms</h2>
          <p>By accessing or using our website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>2. Services Provided</h2>
          <p>Reach Logic provides digital marketing, social media management, paid advertising, and web design services. The specific deliverables, timelines, and costs will be outlined in a separate Statement of Work (SOW) or Service Agreement signed by both parties.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>3. Intellectual Property</h2>
          <p>Unless otherwise stated, Reach Logic and/or its licensors own the intellectual property rights for all material on Reach Logic. All intellectual property rights are reserved. You may access this from Reach Logic for your own personal use subjected to restrictions set in these terms and conditions.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>4. Limitation of Liability</h2>
          <p>In no event shall Reach Logic, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this website whether such liability is under contract. Reach Logic, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this website.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>5. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: <a href="mailto:hello@reachlogic.co" className="text-[#0aad92] hover:underline">hello@reachlogic.co</a>.</p>
        </div>
      </section>
    </>
  );
}
