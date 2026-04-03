import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === "admin" ? "/adminDashboard" : "/dashboard";

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  // Effect to handle scroll background change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks =
    user?.role === "admin"
      ? [
          { path: "/", label: "Home" },
          { path: "/adminDashboard", label: "Dashboard" },
          { path: "/userManagement", label: "Users" },
          { path: "/admin/feedback", label: "Feedback" },
          { path: "/admin/material-approval", label: "Materials" },
          { path: "/admin/settings", label: "Settings" },
        ]
      : [
          { path: "/", label: "Home" },
          { path: "/dashboard", label: "Dashboard" },
          { path: "/materials", label: "Materials" },
          { path: "/groups", label: "Groups" },
          { path: "/posts", label: "Forum" },
          { path: "/dashboard/feedback", label: "Feedback" },
        ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[70px] z-[1000] transition-all duration-300 ${
        scrolled
          ? "app-page backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            U
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--app-text)]">
            Uni<span className="text-blue-400">Connect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "text-amber-400 bg-amber-400/10 border border-amber-400/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="h-5 w-[1px] bg-white/10 mx-3" />

          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/register"
                className="app-surface-soft px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="app-btn-primary px-6 py-2.5 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="app-surface-soft px-3 py-1.5 rounded-xl text-xs text-[var(--app-text)]">
                <span className="font-bold">{user.name || "User"}</span>
                <span className="ml-2 app-text-muted uppercase">
                  {user.role}
                </span>
              </div>
              <Link
                to={dashboardPath}
                className="app-surface-soft px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500/25 transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="text-2xl">{mobileOpen ? "✕" : "☰"}</span>
        </button>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-x-0 top-[70px] app-page border-b border-white/10 p-6 flex flex-col gap-4 md:hidden transition-all duration-300 ${
            mobileOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-10 opacity-0 pointer-events-none"
          }`}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `font-semibold py-2 px-2 rounded transition-colors border-b border-white/5 ${
                  isActive
                    ? "text-amber-400"
                    : "text-gray-300 hover:text-amber-400"
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {!user ? (
            <>
              <Link
                to="/register"
                className="app-surface-soft p-4 rounded-xl font-semibold text-center shadow-lg"
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
              <Link
                to="/login"
                className="app-btn-primary p-4 rounded-xl font-bold text-center shadow-lg"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            </>
          ) : (
            <>
              <div className="app-surface-soft p-3 rounded-xl text-sm text-center">
                <span className="font-bold">{user.name || "User"}</span>
                <span className="ml-2 app-text-muted uppercase">
                  {user.role}
                </span>
              </div>
              <Link
                to={dashboardPath}
                className="app-surface-soft p-4 rounded-xl font-semibold text-center shadow-lg"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="p-4 rounded-xl font-bold text-center bg-red-500/15 border border-red-400/30 text-red-300"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
