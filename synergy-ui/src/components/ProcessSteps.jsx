import { Search, CreditCard, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

const StepNumber = ({ n, isActive }) => (
  <div
    className={`relative flex items-center justify-center transition-all duration-500 ${
      isActive ? "scale-110" : ""
    }`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-700 rounded-2xl blur-lg opacity-50"></div>
    <div className="relative text-5xl md:text-7xl lg:text-8xl font-extrabold bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent select-none">
      {n}
    </div>
  </div>
);

const Step = ({ n, icon: Icon, title, text, reverse, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group transition-all duration-500 ${
        isHovered ? "scale-[1.02]" : ""
      }`}
    >
      <div
        className={`flex flex-col md:flex-row items-center justify-between gap-8 p-6 md:p-10 lg:p-12 rounded-3xl transition-all duration-500 ${
          reverse ? "md:flex-row-reverse" : ""
        } ${
          isHovered
            ? "bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl"
            : "bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <StepNumber n={n} isActive={isHovered} />
          <div
            className={`mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg transition-all duration-500 ${
              isHovered ? "scale-110 rotate-6" : ""
            }`}
          >
            <Icon size={28} className="text-white" />
          </div>
        </div>
        <div
          className={`flex flex-col items-center md:items-start text-center ${
            reverse ? "md:text-right md:items-end" : "md:text-left"
          } max-w-xl space-y-4`}
        >
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-amber-900 transition-colors duration-300 group-hover:text-amber-700">
            {title}
          </h3>
          <p className="text-amber-800 text-base md:text-lg leading-relaxed">
            {text}
          </p>
          <div
            className={`mt-4 h-1.5 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full transition-all duration-500 origin-left ${
              isHovered ? "w-full" : "w-0"
            }`}
          ></div>
        </div>
      </div>

      {index < 2 && (
        <div className="flex justify-center my-6">
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg transition-all duration-500 ${
              isHovered ? "scale-125 rotate-90" : "rotate-90"
            }`}
          >
            <ArrowRight size={24} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProcessSteps() {
  const steps = [
    {
      n: "01",
      icon: Search,
      title: "Search for the Expert You Want to Help You",
      text: "Browse through our curated list of verified professionals across various fields. Filter by expertise, ratings, and availability to find your perfect match.",
    },
    {
      n: "02",
      icon: CreditCard,
      title: "Pay Their Fee Securely",
      text: "Complete the secure payment process with transparent pricing. Only pay for the time you use, with rates clearly displayed before you connect.",
    },
    {
      n: "03",
      icon: MessageCircle,
      title: "Seamless Communication Begins",
      text: "Start your session instantly through video, voice, or text chat. Get personalized guidance and expert insights in real-time.",
    },
  ];

  return (
    <section className="py-20 md:py-28 lg:py-32 bg-gradient-to-b from-white via-amber-50/30 to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-amber-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-orange-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="mb-16 md:mb-20 lg:mb-24 text-center px-6">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-amber-600 border border-amber-300 rounded-full text-sm font-semibold text-white uppercase tracking-wide">
              How It Works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-amber-900 mb-6">
            Our{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Process
              </span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-amber-400/30 blur-sm"></span>
            </span>
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-amber-800 text-lg md:text-xl leading-relaxed">
            A streamlined, user-friendly approach to connecting with experts and
            getting the guidance you need in just three simple steps.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 space-y-8">
          {steps.map((s, i) => (
            <Step key={s.n} {...s} index={i} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
