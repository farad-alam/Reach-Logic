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
        {/* Award 1 — BASIS */}
        <div
          className="rounded-2xl overflow-hidden group flex flex-col"
          style={{ border: "1px solid rgba(10,173,146,0.12)" }}
        >
          <div className="w-full h-80 flex items-center justify-center p-6" style={{ background: "rgba(10,173,146,0.02)" }}>
            <img 
              src="/images/basis-award.jpg" 
              alt="BASIS Outsourcing Award 2021" 
              className="max-w-full max-h-full rounded-xl object-contain shadow-md" 
              style={{ border: "1px solid rgba(10,173,146,0.15)" }}
            />
          </div>
          <div className="p-6" style={{ background: "rgba(10,173,146,0.04)" }}>
            <p className="text-white font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
              BASIS Outsourcing Award 2021
            </p>
            <p className="text-white/50 text-sm">District Level Top Awardee</p>
          </div>
        </div>

        {/* Award 2 — Upwork */}
        <div
          className="rounded-2xl overflow-hidden group flex flex-col"
          style={{ border: "1px solid rgba(10,173,146,0.12)" }}
        >
          <img src="/images/upwork-profile.png" alt="Upwork Personal Profile" className="w-full h-80 object-cover" />
          <div className="p-6 mt-auto" style={{ background: "rgba(10,173,146,0.04)" }}>
            <p className="text-white font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
              Upwork Profile
            </p>
            <p className="text-white/50 text-sm">Personal Profile Screenshot</p>
          </div>
        </div>
      </div>

      {/* BASIS Certification Detail with Certificate Image */}
      <div
        className="mt-10 rounded-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(10,173,146,0.08) 0%, rgba(6,26,22,0.95) 100%)",
          border: "1px solid rgba(10,173,146,0.2)",
        }}
      >
        {/* Glow accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 80% 50%, rgba(10,173,146,0.15) 0%, transparent 60%)",
          }}
        />
        
        <div className="flex flex-col gap-6 items-start relative z-10">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(10,173,146,0.2)]"
            style={{ background: "rgba(10,173,146,0.2)" }}
          >
            <svg className="w-7 h-7 text-[#0aad92]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3
              className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              BASIS Outsourcing Award 2021 — District Level Top Certification
            </h3>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              Recognized by <span className="text-white font-medium">BASIS</span> (Bangladesh Association of
              Software and Information Services) as a top-performing outsourcing professional at the district
              level — one of the most prestigious honors in Bangladesh&apos;s IT and digital services industry.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center md:justify-end relative z-10">
          <img 
            src="/images/basis-certificate.jpg" 
            alt="BASIS Certificate of Achievement" 
            className="w-full max-w-sm rounded-xl shadow-[0_15px_40px_rgba(10,173,146,0.25)] object-contain transition-transform hover:scale-[1.02] duration-300"
            style={{ border: "2px solid rgba(10,173,146,0.3)" }}
          />
        </div>
      </div>
    </section>
  );
}
