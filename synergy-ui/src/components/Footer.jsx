import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-5">
            <h2
              className="text-xl text-white"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
            >
              Synergy
            </h2>
            <p className="text-sm leading-relaxed max-w-xs">
              Connecting people with real experts for guidance, problem-solving, and clarity — instantly and securely.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="/"
                  title="coming soon"
                  className="w-8 h-8 border border-slate-700 rounded-md flex items-center justify-center hover:border-slate-500 hover:text-white transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Find Experts", "Become Expert", "How It Works"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, ""))}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest">Services</h4>
            <ul className="space-y-2">
              {["Video Chat", "Voice Call", "Text Chat", "Expert Directory"].map((item) => (
                <li key={item}>
                  <a href="/" className="text-sm hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-widest">Contact</h4>
            <div className="space-y-3">
              {[
                { Icon: Mail, text: "support@synergy.com" },
                { Icon: Phone, text: "9346589641" },
                { Icon: MapPin, text: "Hyderabad, India" },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <Icon size={14} className="flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {currentYear} Synergy. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms", "Cookies"].map((item) => (
              <a key={item} href="/" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}