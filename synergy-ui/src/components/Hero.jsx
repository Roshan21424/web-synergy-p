import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-amber-50 via-orange-50 to-amber-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative mt-6 mb-10 mx-4 md:mx-8 lg:mx-12">
        <div
          className={`relative bg-cover bg-center rounded-3xl shadow-2xl shadow-amber-900/20 min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden transition-all duration-1000 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{
            backgroundImage: `url(/hero.png)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/35 to-transparent rounded-3xl"></div>
          <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-amber-400/50 rounded-tl-2xl"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-amber-400/50 rounded-br-2xl"></div>

          <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 w-full">
            <div className="max-w-3xl">
              <div
                className={`inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-full px-5 py-2 mb-6 transition-all duration-700 delay-200 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <span className="text-sm font-semibold text-amber-100">
                  Real-Time Expert Connection
                </span>
              </div>

              <h1
                className={`text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight transition-all duration-700 delay-300 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Get{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    Expert Help
                  </span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-amber-500/30 blur-sm"></span>
                </span>
                <br />
                In Real Time
              </h1>

              <p
                className={`text-lg md:text-xl text-white/95 leading-relaxed mb-8 max-w-2xl transition-all duration-700 delay-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Synergy connects you with vetted experts through video, voice,
                or text. Pay per minute at the expert's rate and only for the
                time you use.
              </p>

              <div
                className={`flex flex-wrap gap-4 transition-all duration-700 delay-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <button
                  onClick={() => navigate("/user")}
                  className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-xl shadow-amber-900/30 hover:shadow-2xl hover:shadow-amber-900/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-2"
                >
                  Find An Expert
                  <ArrowRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
                <button
                  onClick={() => navigate("/expert")}
                  className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-xl shadow-amber-900/30 hover:shadow-2xl hover:shadow-amber-900/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-2"
                >
                  Become an Expert
                  <ArrowRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>

              <div
                className={`mt-12 flex flex-wrap gap-8 transition-all duration-700 delay-900 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {[
                  { number: "skilled", label: "Experts support" },
                  { number: "unlimited", label: "Sessions" },
                  { number: "free", label: "service" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-extrabold text-amber-300 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
