import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserSettingsModal from "./UserSettingsModal";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const userInitial = useMemo(() => {
    const raw = user?.name || user?.email || "U";
    return String(raw).trim().charAt(0).toUpperCase() || "U";
  }, [user?.name, user?.email]);

  const avatarSrc = useMemo(() => {
    const url = user?.avatarUrl;
    if (!url) return "";
    const u = String(url);
    if (/^https?:\/\//i.test(u)) return u;
    return u;
  }, [user?.avatarUrl]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const openSettings = () => {
    setSettingsOpen(true);
    setMobileOpen(false);
  };

  // Effect to handle scroll background change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background scroll while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  // Close on ESC
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Prevent background scroll while settings modal is open
  useEffect(() => {
    if (!settingsOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [settingsOpen]);

  const navLinks = useMemo(() => {
    if (!user) return [{ path: "/", label: "Home" }];

    if (user.role === "admin") {
      return [
        { path: "/", label: "Home" },
        { path: "/adminDashboard", label: "Dashboard" },
        { path: "/userManagement", label: "Users" },
        { path: "/admin/feedback", label: "Feedback" },
        { path: "/admin/material-approval", label: "Materials" },
        { path: "/admin/settings", label: "Settings" },
      ];
    }

    return [
      { path: "/", label: "Home" },
      { path: "/dashboard", label: "Dashboard" },
      { path: "/materials", label: "Materials" },
      { path: "/groups", label: "Groups" },
      { path: "/posts", label: "Forum" },
      { path: "/dashboard/feedback", label: "Feedback" },
    ];
  }, [user]);

  const linkBaseClasses =
    "px-3 py-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-page-bg)]";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 h-[70px] z-[1000] transition-all duration-300 ${
          scrolled
            ? "app-page backdrop-blur-xl border-b border-white/10 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
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
        <div className="hidden md:flex items-center gap-3">
          <div className="app-surface-soft rounded-full p-1 flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `${linkBaseClasses} ${
                    isActive
                      ? "app-btn-primary"
                      : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/register"
                className="app-surface-soft px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-page-bg)]"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="app-btn-primary px-5 py-2.5 rounded-full text-sm font-bold hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-page-bg)]"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openSettings}
                className="app-surface-soft px-3 py-1.5 rounded-full text-xs text-[var(--app-text)] flex items-center gap-2 hover:brightness-110 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-page-bg)]"
                aria-label="Open user settings"
              >
                <div className="w-7 h-7 rounded-full app-surface overflow-hidden flex items-center justify-center text-sm font-black">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitial
                  )}
                </div>
                <div className="leading-tight text-left">
                  <div className="font-bold max-w-[140px] truncate">
                    {user.name || "User"}
                  </div>
                  <div className="app-text-muted uppercase tracking-wide text-[10px]">
                    {user.role}
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-page-bg)]"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-[var(--app-text)] bg-white/5 rounded-lg border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-page-bg)]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <span className="text-2xl">{mobileOpen ? "✕" : "☰"}</span>
        </button>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-x-0 top-[70px] bottom-0 md:hidden transition-all duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            type="button"
            aria-label="Close menu"
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileOpen(false)}
          />

          <div
            id="mobile-menu"
            className={`absolute right-0 top-0 bottom-0 w-[min(85vw,360px)] app-page border-l border-white/10 p-6 flex flex-col gap-4 overflow-y-auto transition-transform duration-300 ${
              mobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-modal="true"
          >
            {user ? (
              <button
                type="button"
                onClick={openSettings}
                className="app-surface-soft p-3 rounded-2xl flex items-center gap-3 hover:brightness-110 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)]"
                aria-label="Open user settings"
              >
                <div className="w-10 h-10 rounded-full app-surface overflow-hidden flex items-center justify-center text-lg font-black">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitial
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-bold truncate">{user.name || "User"}</div>
                  <div className="app-text-muted uppercase tracking-wide text-xs">
                    {user.role}
                  </div>
                </div>
              </button>
            ) : (
              <div className="app-surface-soft p-4 rounded-2xl">
                <div className="font-bold">Welcome</div>
                <div className="app-text-muted text-sm">Sign in to access your dashboard and tools.</div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-3 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)] ${
                      isActive
                        ? "app-btn-primary"
                        : "text-[var(--app-text)] hover:bg-white/5"
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {!user ? (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to="/register"
                  className="app-surface-soft p-4 rounded-xl font-semibold text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="app-btn-primary p-4 rounded-xl font-bold text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 p-4 rounded-xl font-bold text-center bg-red-500/15 border border-red-400/30 text-red-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        </div>
      </nav>

      <UserSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Navbar;
