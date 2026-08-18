"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Alex Witthoeft",
    company: "@germanatorfit",
    rating: 5,
    quote: "Hasan was the perfect fit for my job requirements. He is trustworthy and I was able to follow up on all his work. Somehow my instagram wasn't getting any traffic anymore. I let him take over my account and I couldn't be happier. If you need help with your Instagram, He is the man to hire. I highly recommend Hasan and will soon be working with him again.",
    avatar: "AW",
    image: "/images/testimonials/alex-witthoeft.jpg",
  },
  {
    name: "Aaron Perez",
    company: "@highimpact_coaching",
    rating: 5,
    quote: "Monira helped me grow quality target audiences for my clients via Instagram and always performed at the highest level. Highly recommend her to anyone looking to engage and connect with their target audience on social media and especially Instagram.",
    avatar: "AP",
    image: "/images/testimonials/aaron-perez.png",
  },
  {
    name: "Joanna Garzilli",
    company: "@JoannaGarzilli",
    rating: 5,
    quote: "Overall Hasan has been wonderful and we are grateful for the work he has done! There were only a couple of occasions where we made specific requests that were not adhered to however that could be because of misunderstanding in language barrier. If you are looking for support with Instagram engagement Hasan is a gem, one of the best out there!",
    avatar: "JG",
    image: "/images/testimonials/joanna-garzilli.png",
  },
  {
    name: "David Liston",
    company: "@bb360training",
    rating: 5,
    quote: "Hasan was fantastic! We hired him for 35 hours a week for 6 months. He helped us find Instagram followers that were directly related to our cause, which is special needs. He was very professional and I would highly recommend him. Our project has come to an end but I hope we can hire him again in the future.",
    avatar: "DL",
    image: "/images/testimonials/david-liston.jpg",
  },
  {
    name: "Christina Nguyen",
    company: "@bellagibeauty",
    rating: 5,
    quote: "It was pleasure to work with Mst. Monira. She is an Instagram expert. She helped me to gain authentic followers and completed the project successfully on time. She is smart lady. The communication is clear and straightforward. I'd work with her again. Thank you",
    avatar: "CN",
    image: "/images/testimonials/christina-nguyen.jpg",
  },
  {
    name: "Amy Luck",
    company: "@gingermeglam",
    rating: 5,
    quote: "I have been working with these guys since years now! With lots of hard work and timely communication they made sure they delivered the best to me. Highly recommended!",
    avatar: "AL",
    image: "",
  },
  {
    name: "Sarah",
    company: "@wifeychef",
    rating: 5,
    quote: "He did a great job and was very responsive, with good communication. He definitely helped build my Pinterest and Instagram following and take the burden off me (I have other things to focus on aside from doing social media). No complaints, just appreciation. I will use him again in the future!",
    avatar: "S",
    image: "/images/testimonials/sarah.jpg",
  },
  {
    name: "Carla Watkins",
    company: "@yogagreenbook",
    rating: 5,
    quote: "It was a pleasure working with Mst. Monira Khatun. She started work quickly, generated results as promised, and made adjustments based on my business' changing needs. Looking forward to working her again soon",
    avatar: "CW",
    image: "/images/testimonials/carla-watkins.png",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  };

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startInterval();
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startInterval();
  };

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.from(".test-content", {
          scrollTrigger: { trigger: ".test-content", start: "top 80%" },
          immediateRender: false,
          opacity: 0, y: 30, duration: 1, ease: "power3.out",
        });
      }, sectionRef);
    };
    init();
    return () => ctx?.revert();
  }, []);

  const t = testimonials[active];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 md:py-32"
      style={{ background: "#061a16" }}
    >
      <div className="max-w-7xl mx-auto px-6 relative flex flex-col items-center justify-center min-h-[450px] test-content">
        
        {/* Header */}
        <div className="test-header text-center mb-16">
          <span className="inline-block text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "#0aad92" }}>
            Client Stories
          </span>
          <h2
            className="font-extrabold text-white"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1.1 }}
          >
            Don't take our word.
            <br />
            <span className="text-gradient">Take theirs.</span>
          </h2>
        </div>
        
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 z-10"
          style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}
          aria-label="Previous testimonial"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 z-10"
          style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}
          aria-label="Next testimonial"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center max-w-4xl px-8 md:px-16" key={active}>
          {/* Quote Icon */}
          <div className="mb-8">
            <svg width="48" height="36" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "rgba(10,173,146,0.25)" }}>
              <path d="M15.4839 0V11.6129C15.4839 19.498 10.4357 26.6853 0 30L3.10977 17.581C7.03714 16.6343 9.67742 13.9234 9.67742 11.6129V0H15.4839ZM39.6774 0V11.6129C39.6774 19.498 34.6291 26.6853 24.1935 30L27.3033 17.581C31.2307 16.6343 33.871 13.9234 33.871 11.6129V0H39.6774Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Stars */}
          <div className="flex gap-2 mb-8">
            {Array.from({ length: t.rating }).map((_, i) => (
              <svg key={i} className="w-7 h-7" style={{ color: "#0aad92" }} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Quote Text */}
          <blockquote
            className="text-xl md:text-2xl xl:text-3xl font-medium leading-snug md:leading-snug mb-12 text-white italic"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Author */}
          <div className="flex items-center justify-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden relative"
              style={{ background: "linear-gradient(135deg,#085e51,#0aad92)", color: "#fff" }}
            >
              {t.image ? (
                <Image src={t.image} alt={t.name} fill className="object-cover" sizes="48px" />
              ) : (
                t.avatar
              )}
            </div>
            <div className="text-left flex flex-col justify-center">
              <div className="font-semibold text-white text-base flex items-center gap-2">
                {t.name}
              </div>
              {t.company && (
                <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {t.company}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
