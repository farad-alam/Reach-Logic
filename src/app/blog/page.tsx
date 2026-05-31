import InnerPageHero from "@/components/InnerPageHero";
import CTA from "@/components/CTA";

const posts = [
  { title: "The Future of Social Automation in 2027", category: "Social Media", date: "Oct 12, 2026" },
  { title: "Why Your ROAS is Dropping (And How to Fix It)", category: "Paid Ads", date: "Sep 28, 2026" },
  { title: "Design Systems for High-Conversion SaaS", category: "Web Design", date: "Sep 15, 2026" },
  { title: "Scaling Internationally: A Digital Playbook", category: "Strategy", date: "Aug 30, 2026" },
];

export default function BlogPage() {
  return (
    <>
      <InnerPageHero 
        title="Insights & Strategies" 
        description="Latest thoughts on growth, design, and marketing automation."
        tag="The Blog"
      />
      
      <section className="section-pad max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, i) => (
            <div key={i} className="group cursor-pointer bg-[#020f0c] rounded-2xl p-8 border border-[rgba(255,255,255,0.05)] hover:border-[rgba(10,173,146,0.3)] transition-colors duration-300">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#0aad92]">{post.category}</span>
                <span className="text-xs text-white/40">{post.date}</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-[#0aad92] transition-colors" style={{ fontFamily: "var(--font-fraunces)" }}>
                {post.title}
              </h3>
              <p className="text-white/60 mb-6 line-clamp-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="text-sm font-semibold flex items-center gap-2">
                Read Article <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTA />
    </>
  );
}
