import { Globe, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function BecomeExpert() {
  const [imageLoaded, setImageLoaded] = useState(false);

  const benefits = [
    { icon: Globe, text: "Connect with clients globally" },
    { icon: DollarSign, text: "Earn on your own schedule" },
    { icon: TrendingUp, text: "Grow your professional reach" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <img
            src="/expert_willing_to_help.jpeg"
            alt="Become an Expert"
            className={`w-full h-[420px] object-cover rounded-xl transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-6">
            For Experts
          </span>

          <h2
            className="text-4xl md:text-5xl text-slate-900 mb-6"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            Share Your Knowledge,{" "}
            <em style={{ fontStyle: 'italic' }}>Help People Worldwide</em>
          </h2>

          <p className="text-slate-500 leading-relaxed mb-10 max-w-lg">
            Join as an expert in your field, connect with people seeking guidance, and earn while
            making a real impact. Set up your profile in minutes.
          </p>

          <div className="space-y-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon size={15} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">{benefit.text}</span>
              </div>
            ))}
          </div>

          <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Start Earning Today
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}