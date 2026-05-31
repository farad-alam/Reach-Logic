"use client";

const row1 = [
  "Social Media Management",
  "Paid Advertising",
  "Web Design & Development",
  "Organic Growth Strategy",
  "Video Editing & AI Production",
  "Search Engine Optimization (SEO)",
  "Facebook · TikTok · Google Ads",
  "Global Clients",
  "Results-Driven",
  "Automation-First",
];

const row2 = [
  "Scale Faster",
  "More Reach",
  "Higher ROAS",
  "Instagram · LinkedIn",
  "UGC Creatives",
  "Full-Funnel Strategy",
  "90-Day Roadmaps",
  "Data-Informed Content",
];

function TickerRow({
  items,
  speed = 30,
  reverse = false,
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];

  return (
    <div className="ticker-row overflow-hidden">
      <div
        className={reverse ? "ticker-track-reverse" : "ticker-track"}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-4 shrink-0 pl-4"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {item}
            <span style={{ color: "#0aad92", fontSize: "0.55rem", opacity: 0.8 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Ticker() {
  return (
    <div
      className="ticker-pause-wrap overflow-hidden border-y"
      style={{
        borderColor: "rgba(10,173,146,0.12)",
        background: "rgba(8,94,81,0.07)",
        padding: "1.1rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
      }}
    >
      <TickerRow items={row1} speed={32} />
      <TickerRow items={row2} speed={26} reverse />
    </div>
  );
}
