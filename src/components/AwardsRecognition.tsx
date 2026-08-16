export default function AwardsRecognition() {
  return (
    <section className="px-6 py-24 md:px-12 xl:px-0 max-w-6xl mx-auto" aria-label="Awards and Recognition">
      <div className="flex flex-col items-center text-center mb-16">
        <span
          className="px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4 inline-block"
          style={{
            background: "rgba(10,173,146,0.12)",
            border: "1px solid rgba(10,173,146,0.3)",
            color: "#0aad92",
          }}
        >
          Recognized
        </span>
        <h2
          className="text-3xl md:text-5xl font-bold text-white mt-4"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          Awards & Recognition
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-8">
        {/* Award 1, BASIS */}
        <div
          className="rounded-2xl overflow-hidden group flex flex-col h-full"
          style={{ border: "1px solid rgba(10,173,146,0.12)" }}
        >
          <img 
            src="/images/basis-award.jpg" 
            alt="BASIS Outsourcing Award 2021" 
            className="w-full h-auto"
          />
          <div className="p-6 mt-auto" style={{ background: "rgba(10,173,146,0.04)" }}>
            <p className="text-white font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
              BASIS Outsourcing Award 2021
            </p>
            <p className="text-white/50 text-sm">District Level Top Awardee</p>
          </div>
        </div>

        {/* Award 2, Upwork */}
        <div
          className="rounded-2xl overflow-hidden group flex flex-col"
          style={{ border: "1px solid rgba(10,173,146,0.12)" }}
        >
          <img src="/images/upwork-profile.png" alt="Upwork Personal Profile" className="w-full h-full object-contain object-center bg-[#f4f7f6]" />
          <div className="p-6 mt-auto shrink-0" style={{ background: "rgba(10,173,146,0.04)" }}>
            <p className="text-white font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
              Upwork Profile
            </p>
            <p className="text-white/50 text-sm">Personal Profile Screenshot</p>
          </div>
        </div>
      </div>

    </section>
  );
}
