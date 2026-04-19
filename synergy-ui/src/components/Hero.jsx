import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="bg-white pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          className={`max-w-3xl transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-6">
            Real-Time Expert Connection
          </span>

          <h1
            className="text-5xl md:text-7xl text-slate-900 leading-tight mb-6"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            Get Expert Help{" "}
            <em style={{ fontStyle: 'italic', color: '#1d4ed8' }}>In Real Time</em>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-xl">
            Synergy connects you with vetted professionals through video, voice, or text.
            Pay per minute at the expert's rate — only for the time you use.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/user")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Find an Expert
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/expert")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 text-sm font-medium rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors duration-200"
            >
              Become an Expert
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-10 mt-14 pt-10 border-t border-slate-100">
            {[
              { label: "Skilled Experts" },
              { label: "Unlimited Sessions" },
              { label: "Free Service" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}