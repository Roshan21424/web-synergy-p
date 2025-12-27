import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 shadow-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="group">
            <h1 className="uppercase text-2xl md:text-3xl font-extrabold text-amber-900 tracking-tight transition-all duration-300 group-hover:scale-105 group-hover:text-amber-800">
              <span className="inline-block transition-transform duration-300 group-hover:rotate-2">
                S
              </span>
              ynergy
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/home", label: "Home" },
              { to: "/user", label: "User" },
              { to: "/expert", label: "Expert" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative px-4 py-2 text-lg text-amber-800 font-semibold transition-all duration-300 hover:text-amber-900 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-amber-800 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 font-semibold shadow-lg shadow-amber-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/30 hover:scale-105 hover:-translate-y-0.5">
              log out
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors duration-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-in slide-in-from-top">
            {[
              { to: "/home", label: "Home" },
              { to: "/user", label: "User" },
              { to: "/expert", label: "Expert" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-4 py-3 text-lg text-amber-800 font-semibold bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-3">
              <a
                href="#"
                className="px-5 py-3 rounded-xl bg-white text-amber-900 font-semibold border-2 border-amber-900 text-center hover:bg-amber-900 hover:text-amber-50 transition-all duration-300"
              >
                Log out
              </a>
              <a
                href="#cta"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 font-semibold text-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get started
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
