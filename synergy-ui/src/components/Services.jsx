import { Video, Phone, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Services() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    {
      Icon: Video,
      title: "Video Chat",
      description:
        "Face-to-face conversations with crystal-clear video quality",
      color: "from-amber-500 to-orange-600",
    },
    {
      Icon: Phone,
      title: "Voice Call",
      description: "High-quality audio calls for expert consultations",
      color: "from-orange-500 to-red-600",
    },
    {
      Icon: MessageSquare,
      title: "Text Chat",
      description: "Quick messaging for instant expert responses",
      color: "from-amber-600 to-amber-800",
    },
  ];

  return (
    <section
      className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-amber-50 via-white to-amber-50 relative overflow-hidden"
      id="services"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-200 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 lg:px-12 text-center relative z-10">
        <div className="mb-16 md:mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-amber-600 border border-amber-300 rounded-full text-sm font-semibold text-white uppercase tracking-wide">
              Our Services
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-amber-900 leading-tight mb-6">
            Flawless{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Communication
              </span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-amber-300/30 blur-sm"></span>
            </span>
            <br className="hidden md:block" />
            With Experts
          </h2>
          <p className="mt-6 text-amber-800 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Connect with vetted experts through multiple channels for instant,
            personalized support tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {features.map(({ Icon, title, description, color }, index) => (
            <div
              key={title}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative"
            >
              <div
                className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 ${
                  hoveredIndex === index
                    ? "border-amber-300 scale-105"
                    : "border-transparent"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}
                ></div>

                <div className="relative mb-6 inline-flex">
                  <div
                    className={`relative h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    <Icon className="h-10 w-10 text-white" strokeWidth={2.5} />
                  </div>
                  <div
                    className={`absolute inset-0 rounded-2xl border-2 border-amber-300 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500`}
                  ></div>
                </div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-amber-900 mb-3 group-hover:text-amber-800 transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-amber-700 text-base leading-relaxed">
                  {description}
                </p>

                <div
                  className={`mt-6 h-1 bg-gradient-to-r ${color} rounded-full transform origin-left transition-all duration-500 ${
                    hoveredIndex === index ? "scale-x-100" : "scale-x-0"
                  }`}
                ></div>
              </div>

              <div
                className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${color} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
