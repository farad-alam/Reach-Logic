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
          <p>Last updated: Aug 16, 2026</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>1. Agreement</h2>
          <p>By engaging ReachLogic LLC for any service, booking a discovery call, or using our website at reachlogic.net, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.</p>
          <p>ReachLogic LLC is a registered limited liability company located in Wyoming, USA, operating at 1st Floor, Afroza Tower, Uposhohor Newmarket, Rajshahi-6202, Bangladesh.</p>
          
          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>2. Services</h2>
          <p>ReachLogic LLC provides digital marketing services including but not limited to social media management, paid advertising, SEO, web design and development, video editing, organic growth strategy, and AI video production. The exact scope of services for each client is defined in a separate project agreement or proposal.</p>
          <p>All services are custom-built; no two engagements are identical. The deliverables, timelines, and pricing agreed upon in your proposal form part of these terms.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>3. Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>A 50% upfront deposit is required before any work begins</li>
            <li>The remaining 50% is due upon project completion or at the agreed milestone</li>
            <li>Invoices are sent digitally and clients may pay via PayPal, bank transfer, credit card, or any other method agreed upon at the time of engagement</li>
            <li>Work will not commence until the upfront payment is received and confirmed</li>
            <li>Late payments may result in work being paused until the outstanding balance is cleared</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>4. Cancellations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may cancel an upcoming milestone or renewal at any time with written notice</li>
            <li>If you wish to cancel an active contract mid-term, any outstanding payments due for work already completed or in progress must be settled before cancellation is finalised</li>
            <li>ReachLogic LLC reserves the right to cancel an engagement at any time if the client is in breach of these terms, with any unused portion of prepaid fees returned at our discretion</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>5. Revisions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>For editing, web design & development, and other applicable services, up to 3 rounds of revisions are included per deliverable</li>
            <li>Revisions must fall within the original agreed scope</li>
            <li>Additional revisions or out-of-scope changes will be quoted and billed separately</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>6. Client Responsibilities</h2>
          <p>To enable us to deliver effectively, clients agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide timely access to accounts, assets, and brand materials required for the project</li>
            <li>Respond to requests for feedback or approvals within a reasonable timeframe</li>
            <li>Ensure that all materials and information provided to ReachLogic LLC do not infringe on any third-party rights</li>
          </ul>
          <p className="mt-4">Delays caused by late client responses may affect project timelines and ReachLogic LLC will not be held responsible for such delays.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>7. Intellectual Property</h2>
          <p>Upon receipt of full payment, all final deliverables created for the client become the client's property. ReachLogic LLC retains the right to showcase completed work in its portfolio and case studies unless the client requests otherwise in writing.</p>
          <p>All tools, frameworks, processes, and proprietary methodologies used in delivering services remain the intellectual property of ReachLogic LLC.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>8. Confidentiality</h2>
          <p>Both parties agree to keep confidential any sensitive business information shared during the engagement. ReachLogic LLC will not disclose client data, strategies, or account details to any third party without written consent.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>9. Limitation of Liability</h2>
          <p>ReachLogic LLC provides digital marketing services in good faith and with best-practice execution. However, we cannot guarantee specific results such as a defined number of followers, leads, or revenue, as digital marketing outcomes are influenced by factors outside our control including platform algorithm changes, market conditions, and client-side variables.</p>
          <p>ReachLogic's total liability to any client shall not exceed the total fees paid by that client for the specific service in question.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>10. Prohibited Industries</h2>
          <p>ReachLogic LLC does not work with businesses operating in cannabis, alcohol, adult content, or any industry restricted by applicable law. We also reserve the right to decline any project at our discretion.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>11. Governing Law</h2>
          <p>These terms are governed by the laws of Bangladesh. Any disputes arising from these terms or a service engagement will first be attempted to be resolved through direct negotiation. If unresolved, disputes may be referred to the appropriate legal authority in Bangladesh.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>12. Changes to These Terms</h2>
          <p>We may update these Terms of Service from time to time. Continued engagement with ReachLogic LLC after changes are posted constitutes acceptance of the revised terms.</p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>13. Contact</h2>
          <ul className="space-y-2">
            <li><strong>Email:</strong> <a href="mailto:hello@reachlogic.net" className="text-[#0aad92] hover:underline">hello@reachlogic.net</a></li>
            <li><strong>Address:</strong> 1st Floor, Afroza Tower, Uposhohor Newmarket, Rajshahi-6202, Bangladesh</li>
          </ul>
        </div>
      </section>
    </>
  );
}
