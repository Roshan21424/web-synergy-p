import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useMyContext } from "../context/ContextProvider";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useMyContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Synergy
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { to: "/home", label: "Home" },
              { to: "/user", label: "Find Experts" },
              { to: "/expert", label: "For Experts" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              Log out
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-100 pt-4 space-y-1">
            {[
              { to: "/home", label: "Home" },
              { to: "/user", label: "Find Experts" },
              { to: "/expert", label: "For Experts" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 mt-3">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}