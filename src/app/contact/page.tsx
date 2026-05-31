import InnerPageHero from "@/components/InnerPageHero";
import FAQ from "@/components/FAQ";

export default function ContactPage() {
  return (
    <>
      <InnerPageHero 
        title="Let's Talk Growth" 
        description="Ready to scale? Book a discovery call or send us a message below."
        tag="Contact Us"
      />
      
      <section className="section-pad max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-fraunces)" }}>
            Direct Contact
          </h2>
          <p className="text-white/60 mb-8">
            Prefer to email us directly? Reach out and we'll get back to you within 24 hours.
          </p>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-[#0aad92] font-semibold uppercase tracking-widest mb-2">Email</div>
              <a href="mailto:hello@reachlogic.co" className="text-xl hover:text-[#0aad92] transition-colors">hello@reachlogic.co</a>
            </div>
            <div>
              <div className="text-xs text-[#0aad92] font-semibold uppercase tracking-widest mb-2">Location</div>
              <p className="text-xl">Global Remote</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#020f0c] p-8 rounded-2xl border border-[rgba(10,173,146,0.1)]">
          <form className="space-y-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Name</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Email</label>
              <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Service Interest</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors appearance-none">
                <option value="social">Social Media Management</option>
                <option value="ads">Paid Advertising</option>
                <option value="web">Web Design & Development</option>
                <option value="strategy">Digital Growth Strategy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Message</label>
              <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="Tell us about your goals..."></textarea>
            </div>
            <button type="button" className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #085e51, #0aad92)" }}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      <FAQ />
    </>
  );
}
