import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";

const menu = [
  {
    name: "Dashboard",
    path: "/adminDashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      </svg>
    ),
  },
  {
    name: "User Management",
    path: "/admin/users",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="2.5" fill="currentColor" opacity="0.9"/>
        <path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9"/>
        <path d="M11 7c1.1 0 2 .9 2 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <circle cx="12" cy="4.5" r="1.8" fill="currentColor" opacity="0.7"/>
      </svg>
    ),
    children: [
      {
        name: "User & Account Management ",
        path: "/userManagement",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5" cy="4" r="2" fill="currentColor"/>
            <path d="M1 11c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
            <path d="M9.5 6.5h3M11 5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
          </svg>
        ),
      }
    ],
  },
  {
    name: "Study Material & Content ",
    path: "",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3.5C2 2.67 2.67 2 3.5 2H13v11H3.5C2.67 13 2 12.33 2 11.5V3.5Z" 
            stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M5 2V13" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
    </svg>
    ),
  },
  {
    name: "Discussion & Communication",
    path: "",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3h10v7H6l-3 3V3Z" 
            stroke="currentColor" strokeWidth="1.4" fill="none"/>
    </svg>
    ),
  },
  {
    name: "Study Group & System Administration",
    path: "",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5" cy="6" r="2" fill="currentColor"/>
      <circle cx="11" cy="6" r="2" fill="currentColor" opacity="0.7"/>
      <path d="M2 13c0-2 2-3.5 3-3.5s3 1.5 3 3.5" 
            stroke="currentColor" strokeWidth="1.3" fill="none"/>
      <path d="M8 13c0-1.5 1.5-3 3-3s3 1.5 3 3" 
            stroke="currentColor" strokeWidth="1.3" fill="none" opacity="0.7"/>
    </svg>
    ),
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2.5 13.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="4" y="7.5" width="1.8" height="4" rx="0.6" fill="currentColor" opacity="0.9" />
        <rect x="7.1" y="5.8" width="1.8" height="5.7" rx="0.6" fill="currentColor" opacity="0.9" />
        <rect x="10.2" y="3.8" width="1.8" height="7.7" rx="0.6" fill="currentColor" opacity="0.9" />
      </svg>
    ),
    children: [
      { name: "User Management", path: "/admin/analytics/user-management", icon: <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginTop: 4 }} /> },
      { name: "Study Material & Content", path: "/admin/analytics/study-material-content", icon: <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginTop: 4 }} /> },
      { name: "Discussion & Communication", path: "/admin/analytics/discussion-communication", icon: <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginTop: 4 }} /> },
      { name: "Study Group & System Administration", path: "/admin/analytics/study-group-system-administration", icon: <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginTop: 4 }} /> },
    ],
  },
  {
    name: "Reports",
    path: "/admin/reports",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2.5h6l2 2v8.2c0 .44-.36.8-.8.8H4.8a.8.8 0 0 1-.8-.8V3.3c0-.44.36-.8.8-.8Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M10 2.5v2h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.8 7h4.4M5.8 9.2h4.4M5.8 11.4h3.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
    children: [
      { name: "User Management", path: "/admin/reports/user-management", icon: <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginTop: 4 }} /> },
      { name: "Study Material & Content", path: "/admin/reports/study-material-content", icon: <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginTop: 4 }} /> },
      { name: "Discussion & Communication", path: "/admin/reports/discussion-communication", icon: <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginTop: 4 }} /> },
      { name: "Study Group & System Administration", path: "/admin/reports/study-group-system-administration", icon: <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", marginTop: 4 }} /> },
    ],
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2.2l1 .2.5 1.2a4.9 4.9 0 0 1 1 .5l1.2-.4.7.7-.4 1.2c.2.3.4.7.5 1l1.2.5.2 1-.2 1-1.2.5c-.1.3-.3.7-.5 1l.4 1.2-.7.7-1.2-.4c-.3.2-.7.4-1 .5l-.5 1.2-1 .2-1-.2-.5-1.2a4.9 4.9 0 0 1-1-.5l-1.2.4-.7-.7.4-1.2a4.9 4.9 0 0 1-.5-1L2.2 9l-.2-1 .2-1 1.2-.5c.1-.3.3-.7.5-1l-.4-1.2.7-.7 1.2.4c.3-.2.7-.4 1-.5l.5-1.2 1-.2Z"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
        />
        <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.85" />
      </svg>
    ),
  },
];

function Chevron({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{
        transition: "transform 0.22s cubic-bezier(.4,0,.2,1)",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        flexShrink: 0,
      }}
    >
      <path d="M4 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function NavItem({ item, isOpen, onToggle }) {
  const location = useLocation();
  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);
  const hasChildren = Boolean(item.children?.length);
  const isActive = !hasChildren && location.pathname === item.path;
  const isChildActive = hasChildren && item.children.some((c) => location.pathname === c.path);

  const base = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 11px",
    borderRadius: "11px",
    fontSize: "13.5px",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.16s ease",
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
    position: "relative",
    outline: "none",
    background: isActive || isChildActive
      ? "linear-gradient(135deg, rgba(45,212,191,0.18), rgba(20,184,166,0.08))"
      : "transparent",
    color: isActive || isChildActive ? t.accent : isDark ? "#7b8ba3" : "#475569",
    border: isActive || isChildActive ? "1px solid rgba(45,212,191,0.25)" : "1px solid transparent",
    boxShadow: isActive || isChildActive ? "0 8px 20px rgba(20,184,166,0.12)" : "none",
  };

  const hoverIn = (e) => {
    if (!isActive && !isChildActive) {
      e.currentTarget.style.background = isDark ? "rgba(148,163,184,0.09)" : "rgba(15,23,42,0.06)";
      e.currentTarget.style.color = isDark ? "#cbd5e1" : "#0f172a";
      e.currentTarget.style.transform = "translateY(-1px)";
    }
  };
  const hoverOut = (e) => {
    if (!isActive && !isChildActive) {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = isDark ? "#7b8ba3" : "#475569";
      e.currentTarget.style.transform = "translateY(0)";
    }
  };

  const activePill = (
    <span
      style={{
        position: "absolute",
        left: "3px",
        top: "50%",
        transform: "translateY(-50%)",
        width: 3,
        height: 16,
        borderRadius: 2,
        background: t.accent,
      }}
    />
  );

  if (hasChildren) {
    return (
      <div style={{ marginBottom: isOpen ? "10px" : "0px" }}>
        <button onClick={onToggle} style={base} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          {isChildActive && activePill}
          <span style={{ color: "inherit", display: "flex", alignItems: "center" }}>{item.icon}</span>
          <span style={{ flex: 1 }}>{item.name}</span>
          <span style={{ color: "#475569" }}>
            <Chevron open={isOpen} />
          </span>
        </button>

        <div
          style={{
            overflow: "hidden",
            maxHeight: isOpen ? `${item.children.length * 88}px` : "0px",
            transition: "max-height 0.22s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <div
            style={{
              marginLeft: "14px",
              paddingLeft: "12px",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "2px",
              paddingBottom: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "1px",
            }}
          >
            {item.children.map((child) => {
              const childActive = location.pathname === child.path;
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    padding: "9px 10px",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: childActive ? 600 : 400,
                    textDecoration: "none",
                    color: childActive ? t.accent : "#475569",
                    background: childActive ? "rgba(45,212,191,0.08)" : "transparent",
                    transition: "background 0.12s, color 0.12s",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.35,
                  }}
                  onMouseEnter={(e) => {
                    if (!childActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.color = "#64748b";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!childActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#475569";
                    }
                  }}
                >
                  <span style={{ color: "inherit", display: "flex", alignItems: "center", flexShrink: 0 }}>{child.icon}</span>
                  {child.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={item.path} style={base} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {isActive && activePill}
      <span style={{ color: "inherit", display: "flex", alignItems: "center" }}>{item.icon}</span>
      {item.name}
    </Link>
  );
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);

  const [openMenus, setOpenMenus] = useState(() => {
    const init = {};
    menu.forEach((item) => {
      if (item.children?.some((c) => location.pathname === c.path)) {
        init[item.path] = true;
      }
    });
    return init;
  });

  const toggle = (path) => setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div
      style={{
        width: 228,
        height: "100vh",
        background: isDark
          ? "linear-gradient(180deg, #050d1f 0%, #07142a 55%, #061022 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)",
        borderRight: isDark ? "1px solid rgba(148,163,184,0.14)" : `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px 16px",
        flexShrink: 0,
        fontFamily: "'Inter', sans-serif",
        boxShadow: isDark
          ? "inset -1px 0 0 rgba(15,23,42,0.9), 6px 0 20px rgba(2,6,23,0.35)"
          : "inset -1px 0 0 rgba(226,232,240,0.9), 4px 0 14px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "4px 8px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              background: "linear-gradient(135deg, #0d9488, #2dd4bf)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 0 1px rgba(45,212,191,0.3), 0 4px 12px rgba(45,212,191,0.18)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M8.5 2L14 6.5v5L8.5 15 3 11.5v-5L8.5 2z" fill="white" opacity="0.95"/>
              <circle cx="8.5" cy="8.5" r="2.2" fill="#0d9488"/>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: t.text,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              Uni<span style={{ color: "#2dd4bf" }}>Connect</span>
            </div>
            <div style={{ fontSize: "10.5px", color: isDark ? "#475569" : "#64748b", letterSpacing: "0.06em" }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "10px",
          color: isDark ? "#334155" : t.textSubtle,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 700,
          padding: "0 10px",
          marginBottom: "10px",
        }}
      >
        Menu
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          paddingRight: "2px",
        }}
      >
        {menu.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isOpen={!!openMenus[item.path]}
            onToggle={() => toggle(item.path)}
          />
        ))}
      </nav>

      <div
        style={{
          borderTop: isDark ? "1px solid rgba(148,163,184,0.16)" : `1px solid ${t.border}`,
          margin: "14px 4px",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          padding: "9px 10px",
          borderRadius: "12px",
          background: isDark
            ? "linear-gradient(135deg, rgba(30,41,59,0.55), rgba(15,23,42,0.72))"
            : "linear-gradient(135deg, rgba(241,245,249,0.95), rgba(255,255,255,0.95))",
          border: isDark ? "1px solid rgba(148,163,184,0.18)" : "1px solid #d1d5db",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(129,140,248,0.2))",
            border: "1px solid rgba(45,212,191,0.38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            color: isDark ? "#2dd4bf" : "#0d9488",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          A
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
            {user?.name || "Admin"}
          </div>
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8", lineHeight: 1.2 }}>Administrator</div>
        </div>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#34d399",
            flexShrink: 0,
            boxShadow: "0 0 0 2px rgba(52,211,153,0.22)",
          }}
        />
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "10px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 12px",
          borderRadius: "10px",
          border: "1px solid rgba(248,113,113,0.28)",
          background: "linear-gradient(135deg, rgba(69,10,10,0.45), rgba(127,29,29,0.2))",
          color: "#fca5a5",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, rgba(69,10,10,0.65), rgba(127,29,29,0.35))";
          e.currentTarget.style.borderColor = "rgba(248,113,113,0.45)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, rgba(69,10,10,0.45), rgba(127,29,29,0.2))";
          e.currentTarget.style.borderColor = "rgba(248,113,113,0.28)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 2.5H3.8C3.36 2.5 3 2.86 3 3.3v9.4c0 .44.36.8.8.8H6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M10 11.5 13.5 8 10 4.5M13.5 8H6.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
