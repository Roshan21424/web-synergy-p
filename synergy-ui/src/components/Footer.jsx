import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowUp,
} from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-br from-[#3d2817] via-[#4A2E14] to-[#5a3a1f] text-[#FDF6EE] overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className=" p-6 text-left space-y-6">
            <a href="/" className="group block">
              <span className="text-3xl font-bold text-[#F5D7B2] group-hover:text-amber-300 transition">
                SYNERGY
              </span>
              <div className="h-1 w-0 bg-gradient-to-r from-amber-500 to-transparent group-hover:w-full transition-all duration-500 mt-1" />
            </a>

            <p className="text-[#E9D5B5] text-base leading-relaxed font-light max-w-sm">
              Empowering people to connect with real experts for guidance,
              problem-solving, and clarity — instantly and securely.
            </p>

            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  title="coming soon"
                  className="w-10 h-10 cursor-not-allowed rounded-lg bg-white/5 border border-[#6A4222] flex items-center justify-center hover:bg-amber-600 hover:border-amber-600 transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-[#6A4222] rounded-2xl p-6 text-left space-y-5">
            <h4 className="text-xl font-bold text-[#F5D7B2]">Quick Links</h4>
            <ul className="space-y-3">
              {["Home", "Find Experts", "Become Expert", "How It Works"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() =>
                        scrollToSection(item.toLowerCase().replace(" ", ""))
                      }
                      className="flex items-center text-[#E9D5B5] hover:text-white transition"
                    >
                      <span className="w-0 h-px bg-amber-500 group-hover:w-4 transition-all mr-0 group-hover:mr-2" />
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="bg-white/5 border border-[#6A4222] rounded-2xl p-6 text-left space-y-5">
            <h4 className="text-xl font-bold text-[#F5D7B2]">Services</h4>
            <ul className="space-y-3">
              {[
                "Video Chat",
                "Voice Call",
                "Text Chat",
                "Expert Directory",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="flex items-center text-[#E9D5B5] hover:text-white transition"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/5 border border-[#6A4222] rounded-2xl p-6 text-left space-y-5">
            <h4 className="text-xl font-bold text-[#F5D7B2]">Contact Us</h4>

            <div className="space-y-4">
              {[
                { Icon: Mail, text: "support@synergy.com" },
                { Icon: Phone, text: "9346589641" },
                { Icon: MapPin, text: "Hyderabad, India" },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-[#E9D5B5]">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-[#6A4222] flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#6A4222] my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-[#E9D5B5]">
            © {currentYear}{" "}
            <span className="text-amber-400 font-semibold">Synergy</span>. All
            rights reserved.
          </p>

          <div className="flex gap-6">
            {["Privacy Policy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="hover:text-amber-400 transition"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition z-50"
      >
        <ArrowUp size={22} />
      </button>
    </footer>
  );
}
