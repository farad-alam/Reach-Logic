// Server component — zero JS bundle cost
// Renders JSON-LD structured data scripts for SEO

const BASE_URL = "https://www.reachlogic.net";

/** WebSite schema — enables Google Sitelinks Search Box */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Reach Logic",
  url: BASE_URL,
  description:
    "Full-service digital growth agency offering social media management, paid advertising, SEO, and web design.",
};

/** LocalBusiness / MarketingAgency schema — powers Google Knowledge Panel */
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MarketingAgency",
  name: "Reach Logic",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/og-image.png`,
  description:
    "Reach Logic is a full-service digital growth agency offering social media management automation, paid advertising, SEO, web design, and organic growth strategy for brands ready to scale globally.",
  email: "hello@reachlogic.co",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1st Floor, Afroza Tower, Uposhohor Newmarket",
    addressLocality: "Rajshahi",
    postalCode: "6202",
    addressCountry: "BD",
  },
  areaServed: ["Worldwide"],
  sameAs: [
    "https://www.linkedin.com/company/reach-logic/",
    "https://www.facebook.com/ReachLogic",
    "https://www.instagram.com/reach.logic",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Digital Growth Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Social Media Management Automation" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Social Media Marketing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Paid Advertising" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web Design & Development" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Organic Growth Strategy" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Video Editing and AI Video Production" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Search Engine Optimization (SEO)" } },
    ],
  },
};

/** FAQPage schema — unlocks expandable FAQ rich snippets in Google Search */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you work with clients from any country?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — we work with clients globally. Our team is fully remote and serves brands across Europe, North America, Southeast Asia, the Middle East, and beyond. We adapt to your timezone for calls and check-ins, wherever you are.",
      },
    },
    {
      "@type": "Question",
      name: "How quickly can I expect to see results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For paid advertising, clients typically see meaningful results within the first 2–4 weeks as we optimize campaigns. Organic growth through social media and SEO takes 60–90 days to compound. We set clear milestones at every stage so you're never guessing.",
      },
    },
    {
      "@type": "Question",
      name: "What does your onboarding process look like?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After you book a discovery call and we agree to move forward, onboarding takes 3–5 business days. We gather access to your accounts, run an audit, and deliver your 90-day growth roadmap — then execution starts immediately.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer custom packages or only fixed plans?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Everything we do is custom. We don't believe in one-size-fits-all packages. Your budget, your goals, and your market shape the exact services and timeline we recommend. You only pay for what you actually need.",
      },
    },
    {
      "@type": "Question",
      name: "How do you handle reporting and communication?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every client gets a shared dashboard with live metrics, weekly written reports, and a monthly strategy call. We're also available via Slack or WhatsApp for quick questions. Transparency is non-negotiable for us.",
      },
    },
    {
      "@type": "Question",
      name: "What makes Reach Logic different from other agencies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most agencies specialise in one channel. We integrate paid ads, organic social, automation, and web — because growth doesn't happen in silos. We also work on performance-aligned terms and are obsessed with your ROI, not just impressions.",
      },
    },
  ],
};

/** Services ItemList schema for the services page */
export const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Reach Logic Digital Marketing Services",
  description: "Comprehensive digital growth solutions tailored to scale your brand.",
  url: `${BASE_URL}/services`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "Social Media Management Automation",
        description: "AI-powered scheduling, smart content repurposing, and analytics dashboards.",
        provider: { "@type": "MarketingAgency", name: "Reach Logic", url: BASE_URL },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Social Media Marketing",
        description: "Platform-native strategies for Instagram, Facebook, TikTok, and LinkedIn.",
        provider: { "@type": "MarketingAgency", name: "Reach Logic", url: BASE_URL },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Service",
        name: "Paid Advertising",
        description: "High-performance campaigns across Facebook, TikTok, and Google.",
        provider: { "@type": "MarketingAgency", name: "Reach Logic", url: BASE_URL },
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Service",
        name: "Web Design & Development",
        description: "Custom websites, landing pages, and e-commerce experiences that load fast, rank well, and sell hard.",
        provider: { "@type": "MarketingAgency", name: "Reach Logic", url: BASE_URL },
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "Service",
        name: "Organic Growth Strategy",
        description: "Custom 90-day growth plans with full execution support.",
        provider: { "@type": "MarketingAgency", name: "Reach Logic", url: BASE_URL },
      },
    },
    {
      "@type": "ListItem",
      position: 6,
      item: {
        "@type": "Service",
        name: "Video Editing and AI Video Production",
        description: "High-impact video creative optimized for organic reach and paid channels.",
        provider: { "@type": "MarketingAgency", name: "Reach Logic", url: BASE_URL },
      },
    },
    {
      "@type": "ListItem",
      position: 7,
      item: {
        "@type": "Service",
        name: "Search Engine Optimization (SEO)",
        description: "Technical audits, content strategy, and authoritative backlinks for compounding organic traffic.",
        provider: { "@type": "MarketingAgency", name: "Reach Logic", url: BASE_URL },
      },
    },
  ],
};

/** Root layout schemas: WebSite + LocalBusiness + FAQPage */
export function RootJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

/** Services page schema */
export function ServicesJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
    />
  );
}

/** Contact page schema */
export function ContactJsonLd() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Reach Logic",
    url: `${BASE_URL}/contact`,
    description:
      "Contact Reach Logic to book a free strategy discovery call. We serve clients across Europe, North America, Southeast Asia, and beyond.",
    mainEntity: {
      "@type": "MarketingAgency",
      name: "Reach Logic",
      email: "hello@reachlogic.co",
      url: BASE_URL,
      address: {
        "@type": "PostalAddress",
        streetAddress: "1st Floor, Afroza Tower, Uposhohor Newmarket",
        addressLocality: "Rajshahi",
        postalCode: "6202",
        addressCountry: "BD",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
    />
  );
}
