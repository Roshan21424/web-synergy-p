import { Search, Star, Users, ArrowRight, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FindExperts() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  const features = [
    { icon: Search, text: "Browse verified professionals" },
    { icon: Star, text: "View ratings and experience" },
    { icon: Users, text: "Connect instantly" },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-6">
            For Users
          </span>

          <h2
            className="text-4xl md:text-5xl text-slate-900 mb-6"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            Find Experts Online,{" "}
            <em style={{ fontStyle: 'italic' }}>Instantly</em>
          </h2>

          <p className="text-slate-500 leading-relaxed mb-10 max-w-lg">
            Connect with the right experts in real time. Browse verified professionals,
            view their ratings and experience, and start a session right away.
          </p>

          <div className="space-y-4 mb-10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon size={15} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/user")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 w-fit"
            >
              Connect to Experts
              <ArrowRight size={16} />
            </button>
            <div className="flex items-center gap-5 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-500" />
                <span>Unlimited Experts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-500" />
                <span>Verified Profiles</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <img
            src="/man_looking_for_help.jpeg"
            alt="Find Experts Online"
            className={`w-full h-[420px] object-cover rounded-xl transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>
    </section>
  );
}