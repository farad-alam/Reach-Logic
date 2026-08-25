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
          <p>Last updated: Aug 16, 2026</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>1. Introduction</h2>
          <p>Welcome to ReachLogic LLC ("we," "us," or "our"). We are a full-service digital marketing agency operating at 1st Floor, Afroza Tower, Uposhohor Newmarket, Rajshahi-6202, Bangladesh. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website at reachlogic.net or engage with our services.</p>
          <p>By using our website or working with us, you agree to the practices described in this policy.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>2. Information We Collect</h2>
          <p><strong>Information you provide directly:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, phone number, and any other details submitted through our contact or booking forms</li>
            <li>Business information shared during discovery calls or onboarding</li>
            <li>Account credentials and access details shared for service delivery purposes</li>
          </ul>
          <p className="mt-4"><strong>Information collected automatically:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address, browser type, and device information</li>
            <li>Pages visited, time spent on site, and referral sources via analytics tools (such as Google Analytics)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Respond to enquiries and book discovery calls</li>
            <li>Deliver the services you have engaged us for</li>
            <li>Send project updates, reports, and communication related to your account</li>
            <li>Improve our website and service quality</li>
            <li>Send occasional marketing emails (only with your consent; you can opt out at any time)</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-4">We do not sell, rent, or trade your personal information to any third party.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>4. Cookies</h2>
          <p>Our website uses cookies to enhance your browsing experience and gather analytics data. You can disable cookies through your browser settings at any time, though this may affect certain site functionality.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>5. Third-Party Tools</h2>
          <p>To deliver our services, we may use third-party platforms including but not limited to Meta Business Suite, Google Ads, Google Analytics, and project management or communication tools. These platforms have their own privacy policies and we encourage you to review them.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>6. Data Security</h2>
          <p>We take reasonable technical and organisational measures to protect your personal information from unauthorised access, loss, or misuse. However, no method of data transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>7. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. Client project data is typically retained for up to 2 years after the end of an engagement.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent for marketing communications at any time</li>
            <li>Request that we stop processing your data in certain circumstances</li>
          </ul>
          <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:hello@reachlogic.net" className="text-[#0aad92] hover:underline">hello@reachlogic.net</a>.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. Continued use of the website after changes constitutes acceptance of the revised policy.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>10. Contact</h2>
          <p>For any privacy-related questions, reach us at:</p>
          <ul className="space-y-2 mt-4">
            <li><strong>Email:</strong> <a href="mailto:hello@reachlogic.net" className="text-[#0aad92] hover:underline">hello@reachlogic.net</a></li>
            <li><strong>USA Office:</strong> 30 N Gould St Ste R, Sheridan, WY 82801, United States</li>
            <li><strong>BD Office:</strong> 1st Floor, Afroza Tower, Uposhohor Newmarket, Rajshahi-6202, Bangladesh</li>
          </ul>
        </div>
      </section>
    </>
  );
}
