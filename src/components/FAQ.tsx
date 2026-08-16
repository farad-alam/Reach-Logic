"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    q: "Do you work with clients from any country?",
    a: "Yes. We work with clients worldwide and have experience serving businesses across Europe, America, Canada, Southeast Asia, the Middle East, and beyond. We adapt to your timezone for calls and check-ins, wherever you are.",
  },
  {
    q: "How quickly can I expect to see results?",
    a: "For paid advertising, clients typically see meaningful results within the first 2–4 weeks as we optimize campaigns. Organic growth through social media and SEO takes 60–90 days to compound. We set clear milestones at every stage so you're never guessing.",
  },

  {
    q: "Do you offer custom packages or only fixed plans?",
    a: "Everything we do is custom. We don't believe in one-size-fits-all packages. Your budget, your goals, and your market shape the exact services and timeline we recommend. You only pay for what you actually need.",
  },
  {
    q: "How do you handle reporting and communication?",
    a: "Every client gets a shared dashboard with live metrics, weekly written reports, and a monthly strategy call. We're also available via Slack or WhatsApp for quick questions. Transparency is non-negotiable for us.",
  },
  {
    q: "What makes Reach Logic different from other agencies?",
    a: "Most agencies specialise in one channel. We integrate paid ads, organic social, automation, and web — because growth doesn't happen in silos. We also work on performance-aligned terms and are obsessed with your ROI, not just impressions.",
  },
  {
    q: "Do you provide services for any niche?",
    a: "Yes. We've worked with brands across e-commerce, real estate, fitness, beauty, medspa, hospitality, professional services, and more. Our strategy-first approach means we adapt to your industry, audience, and market - not the other way around. If your business needs to grow online, we can build a plan for it. That said, we do not work with cannabis, alcohol, adult content, or any industries restricted by law. We also reserve the right to decline projects in areas we're not comfortable working in.",
  },
  {
    q: "Can I cancel my plan anytime?",
    a: "Yes. You can cancel anytime for upcoming milestones with no issue. If you wish to cancel an existing active contract, any outstanding payments due up to that point must be settled before the cancellation is processed. We'll calculate the exact amount owed and share it with you clearly so there are no surprises.",
  },
  {
    q: "How many revisions are allowed?",
    a: "For editing, web design & development, and other applicable services, we allow up to 3 rounds of revisions per deliverable. Revisions beyond that, or requests outside the original agreed scope, will be quoted as additional work.",
  },
  {
    q: "Do you have a refund policy?",
    a: "Due to the nature of digital marketing services, all payments are non-refundable once work has commenced. The 50% upfront deposit is used immediately to begin research, strategy, and resource allocation. For full details, please review our Refund Policy page.",
  },
  {
    q: "Who will I be working with?",
    a: "Every project is assigned a dedicated account manager who serves as your main point of contact. Depending on your service scope, you may also work with a specialist team - our ads manager handles paid advertising, our social media manager oversees content and community, our developer handles any web work, and our media editor takes care of video and creative production. You get the right expert on every part of your project, coordinated under one roof.",
  },
  {
    q: "Do you offer one-time projects or only monthly retainers?",
    a: "We offer both. One-time projects are available for services like web design, video editing, and campaign setup. For social media management, SEO, and paid advertising, we recommend a minimum 3-month engagement -these services compound over time, and 90 days is where you start seeing meaningful, measurable results.",
  },
  {
    q: "What if I'm not happy with the results?",
    a: "We take this seriously. Every engagement includes clear milestones and weekly reporting so you always know where things stand - there are no surprises. If results aren't meeting expectations, we conduct a full strategy review and adjust our approach at no extra cost. Our goal is your growth, and we won't stop optimizing until we get there.",
  },
  {
    q: "What is your minimum budget or engagement size?",
    a: "It depends on the service. As a general guide: social media management and organic growth typically start from $500/month, while paid advertising, SEO, and full-service engagements range from $1,000 to $5,000+ depending on scope, platforms, and goals. Web design and development is quoted per project. Book a free discovery call and we'll give you an honest recommendation based on what your brand actually needs.",
  },
  {
    q: "How do I reach you if I have an urgent issue?",
    a: "You can contact your dedicated account manager directly for day-to-day matters. For urgent issues, you can reach our CEO directly or open a support ticket through the site - we treat urgent requests as a priority and aim to respond within a few hours during business days.",
  },
  {
    q: "How do you measure success?",
    a: "Success looks different depending on the service - but we always tie it to business outcomes, not vanity metrics. For paid ads we track ROAS, cost per lead, and conversions. For social media we measure reach, engagement rate, and follower growth. For SEO we track keyword rankings, organic traffic, and leads. For web projects we monitor conversion rate and page performance. Every client gets a shared live dashboard so you can see exactly how your investment is performing at any time.",
  },
  {
    q: "How long does onboarding take?",
    a: "Onboarding typically takes 3 to 5 business days. Once you're confirmed as a client, we gather access to your relevant accounts and assets, conduct an initial audit of your current setup, and align on your goals and project roadmap - then execution begins immediately. The exact onboarding steps vary by service: marketing and social media clients receive a custom 90-day growth plan, while web and development clients move into discovery and wireframing. Whatever your service, we move fast so you're not waiting weeks to see progress.",
  },
  {
    q: "What do you need from me to get started?",
    a: "Not much. After your discovery call, we'll need access to your relevant social media accounts, ad accounts, or website, depending on the services agreed. A brief brand overview, any existing assets (logos, brand guidelines, past content), and your main business goals are helpful but not required upfront - we'll gather everything we need during onboarding. The simpler your side of the process, the better.",
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const elements = [
      headerRef.current,
      ...itemRefs.current.filter(Boolean),
    ].filter(Boolean) as HTMLElement[];

    elements.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.filter = "blur(8px)";
      el.style.transition = `opacity 0.7s ease ${i * 0.07}s, transform 0.7s ease ${i * 0.07}s, filter 0.7s ease ${i * 0.07}s`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            (entry.target as HTMLElement).style.filter = "blur(0px)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pad"
      style={{ background: "linear-gradient(180deg, #061a16 0%, #042f28 100%)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-14">
          <span className="inline-block text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "#0aad92" }}>
            FAQ
          </span>
          <h2
            className="font-extrabold text-white"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 1.1 }}
          >
            Questions you&apos;re
            <br />
            <span className="text-gradient">probably thinking.</span>
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="rounded-2xl overflow-hidden transition-colors duration-300"
              style={{
                background: open === i ? "rgba(8,94,81,0.2)" : "rgba(255,255,255,0.03)",
                border: open === i ? "1px solid rgba(10,173,146,0.3)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                className="w-full text-left px-7 py-5 flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className="font-semibold text-base text-white"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {f.q}
                </span>
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300"
                  style={{
                    background: open === i ? "#0aad92" : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    transform: open === i ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-500"
                style={{ maxHeight: open === i ? "300px" : "0px" }}
              >
                <p
                  className="px-7 pb-6 text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {f.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="text-center mt-12">
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Still have questions?
          </p>
          <a
            href="mailto:hello@reachlogic.net"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-4 transition-all duration-300"
            style={{ color: "#0aad92" }}
          >
            Write to us directly <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
