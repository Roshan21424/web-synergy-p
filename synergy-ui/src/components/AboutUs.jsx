import { useEffect, useState } from "react";

const domains = [
  {
    id: "tech",
    label: "Technology",
    description: "Software, AI, systems, and architecture experts.",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Investments, accounting, and financial strategy.",
  },
  {
    id: "legal",
    label: "Legal",
    description: "Contracts, compliance, and legal advisory.",
  },
  {
    id: "health",
    label: "Healthcare",
    description: "Medical, fitness, and wellness professionals.",
  },
  {
    id: "education",
    label: "Education",
    description: "Career guidance, academics, and mentoring.",
  },
  {
    id: "design",
    label: "Design",
    description: "UI/UX, branding, and creative direction.",
  },
];

export default function AboutUs() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % domains.length),
      3000
    );
    return () => clearInterval(timer);
  }, []);

  const current = domains[index];

  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-600 border border-amber-300 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-semibold text-white uppercase">
              About Synergy
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-amber-900 mb-6">
            Experts Across Every Domain
          </h2>

          <p className="text-lg text-amber-800 leading-relaxed mb-10 max-w-xl">
            Synergy connects you with verified professionals across multiple
            industries. Whether it’s strategy, execution, or problem-solving,
            you get real help — instantly.
          </p>

          <div className="relative bg-white/80 backdrop-blur rounded-2xl p-8 border border-amber-200 shadow-lg max-w-xl">
            <p className="text-sm uppercase tracking-widest text-amber-600 mb-2">
              Domain Focus
            </p>

            <h3 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {current.label}
            </h3>

            <p className="mt-3 text-amber-800 text-base md:text-lg">
              {current.description}
            </p>

            <div className="flex justify-center gap-2 mt-6">
              {domains.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-amber-600" : "w-2 bg-amber-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative lg:order-last">
          <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-3xl blur-2xl"></div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>

            <div className="relative overflow-hidden rounded-3xl shadow-2xl transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
              <img
                src="/banner.jpg"
                alt="Find Experts Online"
                className={`w-full h-[450px] md:h-[550px] object-cover transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
