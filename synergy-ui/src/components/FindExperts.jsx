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
    <section className="relative px-6 md:px-10 lg:px-16 py-24 md:py-32 lg:py-40 bg-gradient-to-br from-white via-amber-50/30 to-white overflow-hidden">
      <div className="absolute top-20 left-0 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-amber-600 border border-amber-300 rounded-full px-5 py-2">
              <span className="text-sm font-semibold text-white uppercase tracking-wide">
                For Users
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-amber-900 leading-tight">
              Find Experts{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Online</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-gradient-to-r from-amber-400 to-amber-600 opacity-30 blur-sm"></span>
              </span>
              <br />
              Instantly
            </h2>

            <p className="text-amber-800 text-lg md:text-xl leading-relaxed max-w-xl">
              Connect with the right experts in real time. Simply choose your
              field of interest, browse through verified professionals, and view
              their profiles with ratings and experience.
            </p>

            <div className="space-y-4 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon size={20} className="text-white" />
                  </div>
                  <span className="text-lg font-semibold text-amber-900 group-hover:text-amber-700 transition-colors duration-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate("/user")}
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold rounded-xl shadow-xl shadow-amber-900/30 hover:shadow-2xl hover:shadow-amber-900/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center gap-3"
              >
                Connect to Experts
                <ArrowRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-2"
                />
              </button>

              <div className="flex items-center gap-6 mt-6 text-sm text-amber-700">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="font-medium">unlimited Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="font-medium">Verified Profiles</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:order-last">
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-3xl blur-2xl"></div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>

              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
                <img
                  src="/man_looking_for_help.jpeg"
                  alt="Find Experts Online"
                  className={`w-full h-[450px] md:h-[550px] object-cover transition-all duration-700 group-hover:scale-110 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-transparent"></div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6 border-4 border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-amber-900">
                      free
                    </div>
                    <div className="text-sm text-amber-700">sessions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
