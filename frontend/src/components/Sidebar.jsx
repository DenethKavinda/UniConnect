import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
  const hasChildren = Boolean(item.children?.length);
  const isActive = !hasChildren && location.pathname === item.path;
  const isChildActive = hasChildren && item.children.some((c) => location.pathname === c.path);

  const base = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 10px",
    borderRadius: "9px",
    fontSize: "13.5px",
    fontWeight: 500,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.14s, color 0.14s",
    letterSpacing: "-0.01em",
    lineHeight: 1,
    position: "relative",
    outline: "none",
    background: isActive || isChildActive ? "rgba(45,212,191,0.1)" : "transparent",
    color: isActive || isChildActive ? "#2dd4bf" : "#64748b",
  };

  const hoverIn = (e) => {
    if (!isActive && !isChildActive) {
      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      e.currentTarget.style.color = "#94a3b8";
    }
  };
  const hoverOut = (e) => {
    if (!isActive && !isChildActive) {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = "#64748b";
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
        background: "#2dd4bf",
      }}
    />
  );

  if (hasChildren) {
    return (
      <div>
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
            maxHeight: isOpen ? `${item.children.length * 40}px` : "0px",
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
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 10px",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: childActive ? 600 : 400,
                    textDecoration: "none",
                    color: childActive ? "#2dd4bf" : "#475569",
                    background: childActive ? "rgba(45,212,191,0.08)" : "transparent",
                    transition: "background 0.12s, color 0.12s",
                    letterSpacing: "-0.01em",
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

  return (
    <div
      style={{
        width: 228,
        minHeight: "100vh",
        background: "#060d1f",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 10px 16px",
        flexShrink: 0,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Logo ── */}
      <div style={{ padding: "4px 8px 20px" }}>
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
                color: "#f1f5f9",
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              Uni<span style={{ color: "#2dd4bf" }}>Connect</span>
            </div>
            <div style={{ fontSize: "10.5px", color: "#334155", letterSpacing: "0.04em" }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* ── Section label ── */}
      <div
        style={{
          fontSize: "10px",
          color: "#1e293b",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 600,
          padding: "0 10px",
          marginBottom: "6px",
        }}
      >
        Menu
      </div>

      {/* ── Nav ── */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        {menu.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isOpen={!!openMenus[item.path]}
            onToggle={() => toggle(item.path)}
          />
        ))}
      </nav>

      {/* ── Divider ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", margin: "12px 4px" }} />

      {/* ── Admin card ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          padding: "8px 10px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(129,140,248,0.2))",
            border: "1px solid rgba(45,212,191,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            color: "#2dd4bf",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          A
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
            Admin
          </div>
          <div style={{ fontSize: "11px", color: "#334155", lineHeight: 1.2 }}>Administrator</div>
        </div>
        {/* Online dot */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#34d399",
            flexShrink: 0,
            boxShadow: "0 0 0 2px rgba(52,211,153,0.2)",
          }}
        />
      </div>
    </div>
  );
}

export default Sidebar;