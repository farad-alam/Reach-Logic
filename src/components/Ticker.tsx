"use client";

const items = [
  "Social Media Management",
  "Paid Advertising",
  "Web Design & Development",
  "Digital Growth Strategy",
  "FB · TT · Google Ads",
  "Global Clients",
  "Results-Driven",
  "Automation-First",
  "Scale Faster",
  "More Reach",
];

export default function Ticker() {
  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden py-5 border-y"
      style={{
        borderColor: "rgba(10,173,146,0.15)",
        background: "rgba(8,94,81,0.08)",
      }}
    >
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-5 shrink-0 pl-5"
            style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            {item}
            <span style={{ color: "#0aad92", fontSize: "0.6rem" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
