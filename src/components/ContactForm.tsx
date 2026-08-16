"use client";

import { useState } from "react";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Here is where you would normally send the data to a backend, e.g.:
    // const formData = new FormData(e.currentTarget);
    // await fetch('/api/contact', { method: 'POST', body: formData });

    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset form success message after 5 seconds
    setTimeout(() => {
      setIsSuccess(false);
      const form = e.target as HTMLFormElement;
      if (form) form.reset();
    }, 5000);
  };

  return (
    <form className="space-y-6" aria-label="Contact form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="contact-name" className="block text-sm text-white/60 mb-2">Name*</label>
        <input id="contact-name" name="name" type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="John Doe" />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm text-white/60 mb-2">Email*</label>
        <input id="contact-email" name="email" type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="john@example.com" />
      </div>
      <div>
        <label htmlFor="contact-service" className="block text-sm text-white/60 mb-2">Service Interest*</label>
        <select id="contact-service" name="service" required defaultValue="" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors appearance-none">
          <option value="" disabled className="bg-[#020f0c] text-white">Select a service</option>
          <option value="social-strategy" className="bg-[#020f0c] text-white">Social Media Strategy</option>
          <option value="social-management" className="bg-[#020f0c] text-white">Social Media Management</option>
          <option value="engagement-strategy" className="bg-[#020f0c] text-white">Engagement Strategy</option>
          <option value="ads" className="bg-[#020f0c] text-white">Paid Advertising</option>
          <option value="social-marketing" className="bg-[#020f0c] text-white">Social Media Marketing</option>
          <option value="web" className="bg-[#020f0c] text-white">Web Design & Development</option>
          <option value="strategy" className="bg-[#020f0c] text-white">Organic Growth Strategy</option>
          <option value="video" className="bg-[#020f0c] text-white">Video Editing & AI Production</option>
          <option value="seo" className="bg-[#020f0c] text-white">Search Engine Optimization (SEO)</option>
          <option value="other" className="bg-[#020f0c] text-white">Other Service or General Inquiry</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-3">Your Budget*</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer relative">
            <input type="radio" name="budget" value="500-1000" className="peer sr-only" required />
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80 transition-all hover:border-white/30 peer-checked:border-[#0aad92] peer-checked:text-white peer-checked:bg-[#0aad92]/10">
              $500 - $1,000
            </div>
          </label>
          <label className="cursor-pointer relative">
            <input type="radio" name="budget" value="1000-3000" className="peer sr-only" required />
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80 transition-all hover:border-white/30 peer-checked:border-[#0aad92] peer-checked:text-white peer-checked:bg-[#0aad92]/10">
              $1,000 - $3,000
            </div>
          </label>
          <label className="cursor-pointer relative">
            <input type="radio" name="budget" value="3000-5000" className="peer sr-only" required />
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80 transition-all hover:border-white/30 peer-checked:border-[#0aad92] peer-checked:text-white peer-checked:bg-[#0aad92]/10">
              $3,000 - $5,000
            </div>
          </label>
          <label className="cursor-pointer relative">
            <input type="radio" name="budget" value="5000+" className="peer sr-only" required />
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/80 transition-all hover:border-white/30 peer-checked:border-[#0aad92] peer-checked:text-white peer-checked:bg-[#0aad92]/10">
              $5,000+
            </div>
          </label>
        </div>
      </div>
      <div>
        <label htmlFor="contact-url" className="block text-sm text-white/60 mb-2">Website/Social Media URL</label>
        <input id="contact-url" name="url" type="url" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="https://example.com" />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm text-white/60 mb-2">Message*</label>
        <textarea id="contact-message" name="message" required rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0aad92] transition-colors" placeholder="Tell us about your goals..."></textarea>
      </div>
      
      <div className="relative">
        <button 
          type="submit" 
          disabled={isSubmitting || isSuccess}
          className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100" 
          style={{ background: "linear-gradient(135deg, #085e51, #0aad92)" }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : isSuccess ? (
            "Message Sent!"
          ) : (
            "Send Message"
          )}
        </button>
        {isSuccess && (
          <p className="text-[#0aad92] text-sm text-center mt-3 absolute w-full">
            Thank you! We'll get back to you shortly.
          </p>
        )}
      </div>
    </form>
  );
}
