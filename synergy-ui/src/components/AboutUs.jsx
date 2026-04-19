import { useEffect, useState } from "react";

const domains = [
  { id: "tech", label: "Technology", description: "Software, AI, systems, and architecture experts." },
  { id: "finance", label: "Finance", description: "Investments, accounting, and financial strategy." },
  { id: "legal", label: "Legal", description: "Contracts, compliance, and legal advisory." },
  { id: "health", label: "Healthcare", description: "Medical, fitness, and wellness professionals." },
  { id: "education", label: "Education", description: "Career guidance, academics, and mentoring." },
  { id: "design", label: "Design", description: "UI/UX, branding, and creative direction." },
];

export default function AboutUs() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % domains.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const current = domains[index];

  return (
    <section className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-6">
            About Synergy
          </span>

          <h2
            className="text-4xl md:text-5xl text-slate-900 mb-6"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            Experts Across Every Domain
          </h2>

          <p className="text-slate-500 leading-relaxed mb-10 max-w-xl">
            Synergy connects you with verified professionals across multiple industries.
            Whether it's strategy, execution, or problem-solving — you get real help, instantly.
          </p>

          <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Domain Focus
            </p>
            <h3
              className="text-3xl text-slate-900 mb-2"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
            >
              {current.label}
            </h3>
            <p className="text-slate-500">{current.description}</p>
            <div className="flex gap-1.5 mt-6">
              {domains.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-blue-600" : "w-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <img
            src="/banner.jpg"
            alt="Find Experts Online"
            className="w-full h-[420px] object-cover rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}