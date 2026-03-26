import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/materials", label: "Materials" },
    { path: "/groups", label: "Groups" },
    { path: "/posts", label: "Discussions" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[70px] z-[1000] transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0d17]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            U
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Uni<span className="text-blue-400">Connect</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="bg-amber-500 text-[#0a0d17] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
          >
            Login
          </Link>
        </div>

        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="text-2xl">{mobileOpen ? "✕" : "☰"}</span>
        </button>

        {mobileOpen && (
          <div className="absolute top-[70px] left-0 right-0 bg-white border-b border-gray-200 md:hidden">
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors text-center"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
