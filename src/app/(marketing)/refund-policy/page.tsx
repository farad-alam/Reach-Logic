import type { Metadata } from "next";
import InnerPageHero from "@/components/InnerPageHero";

export const metadata: Metadata = {
  title: "Refund Policy",
  robots: { index: false, follow: false },
};

export default function RefundPolicyPage() {
  return (
    <>
      <InnerPageHero 
        title="Refund Policy" 
        tag="Legal"
      />
      
      <section className="section-pad max-w-3xl mx-auto">
        <div className="text-white/80 space-y-6 leading-relaxed">
          <p>Last updated: Aug 16, 2026</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>1. Overview</h2>
          <p>At ReachLogic LLC, we are committed to delivering high-quality digital marketing services and maintaining transparent, fair relationships with every client. This Refund Policy outlines the conditions under which refunds may be issued.</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>2. Upfront Deposit</h2>
          <p>All projects require a 50% upfront deposit before work begins. This deposit is used immediately to allocate team resources, begin research, and initiate project planning.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>3. Full Refund Window</h2>
          <p>A full refund of the upfront deposit is available if you request it within 3 calendar days of making your payment, provided that work has not yet commenced. If our team has already begun any research, strategy, or execution on your project within that window, the refund may be partially reduced to account for work completed.</p>
          <p>To request a refund within this window, contact us at <a href="mailto:hello@reachlogic.net" className="text-[#0aad92] hover:underline">hello@reachlogic.net</a> with your payment details and reason for cancellation.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>4. After the Refund Window</h2>
          <p>Once 3 calendar days have passed from the date of payment or work has commenced, whichever comes first, all payments are non-refundable. This applies to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The 50% upfront deposit</li>
            <li>Any milestone or final payments made</li>
          </ul>
          <p className="mt-4">This is because digital marketing services involve significant time, labour, strategy, and resource allocation that cannot be recovered once invested.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>5. Exceptions</h2>
          <p>Refunds outside the standard window will not be issued for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dissatisfaction with results influenced by factors outside ReachLogic's control (platform algorithm changes, market conditions, client-side delays, etc.)</li>
            <li>Change of mind after work has commenced</li>
            <li>Failure to provide required assets or approvals that delayed or limited project delivery</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>6. Dispute Resolution</h2>
          <p>If you are unhappy with any aspect of our service, we strongly encourage you to contact your account manager or reach out to us directly at <a href="mailto:hello@reachlogic.net" className="text-[#0aad92] hover:underline">hello@reachlogic.net</a> before pursuing any formal dispute. We are committed to resolving concerns fairly and promptly.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>7. How Refunds Are Processed</h2>
          <p>Approved refunds will be returned using the same payment method used for the original transaction. Processing time may vary depending on the payment method; it is typically 5 to 10 business days.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>8. Contact</h2>
          <p>For any refund requests or questions about this policy:</p>
          <ul className="space-y-2 mt-4">
            <li><strong>Email:</strong> <a href="mailto:hello@reachlogic.net" className="text-[#0aad92] hover:underline">hello@reachlogic.net</a></li>
            <li><strong>Address:</strong> 1st Floor, Afroza Tower, Uposhohor Newmarket, Rajshahi-6202, Bangladesh</li>
          </ul>
        </div>
      </section>
    </>
  );
}
