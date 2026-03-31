// Sidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menu = [
  {
    name: "Dashboard",
    path: "/adminDashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="1"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity="0.9"
        />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity="0.9"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity="0.9"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
    ),
  },
  {
    name: "User Management",
    path: "/admin/users",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="2.5" fill="currentColor" opacity="0.9" />
        <path
          d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M11 7c1.1 0 2 .9 2 2v1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <circle cx="12" cy="4.5" r="1.8" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    children: [
      {
        name: "User & Account Management",
        path: "/userManagement",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5" cy="4" r="2" fill="currentColor" />
            <path
              d="M1 11c0-2.21 1.79-4 4-4s4 1.79 4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M9.5 6.5h3M11 5v3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        ),
      },
    ],
  },
  {
    name: "Study Material & Content",
    path: "/material-approval", // <-- updated path
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 3.5C2 2.67 2.67 2 3.5 2H13v11H3.5C2.67 13 2 12.33 2 11.5V3.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M5 2V13"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.6"
        />
      </svg>
    ),
  },
  {
    name: "Discussion & Communication",
    path: "/discussion",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 3h10v7H6l-3 3V3Z"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
        />
      </svg>
    ),
  },
  {
    name: "Study Group & System Administration",
    path: "/groups",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="6" r="2" fill="currentColor" />
        <circle cx="11" cy="6" r="2" fill="currentColor" opacity="0.7" />
        <path
          d="M2 13c0-2 2-3.5 3-3.5s3 1.5 3 3.5"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M8 13c0-1.5 1.5-3 3-3s3 1.5 3 3"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
          opacity="0.7"
        />
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
        transition: "transform 0.22s",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
      }}
    >
      <path
        d="M4 2.5l4 3.5-4 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavItem({ item, isOpen, onToggle }) {
  const location = useLocation();
  const hasChildren = item.children?.length > 0;
  const isActive = location.pathname === item.path;
  const isChildActive =
    hasChildren && item.children.some((c) => location.pathname === c.path);

  const baseStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    color: isActive || isChildActive ? "#eab308" : "#94a3b8",
    background:
      isActive || isChildActive ? "rgba(234,179,8,0.1)" : "transparent",
    position: "relative",
  };

  const activePill = (
    <span
      style={{
        position: "absolute",
        left: 3,
        top: "50%",
        transform: "translateY(-50%)",
        width: 3,
        height: 16,
        borderRadius: 2,
        background: "#eab308",
      }}
    />
  );

  if (hasChildren) {
    return (
      <div>
        <button onClick={onToggle} style={baseStyle}>
          {isChildActive && activePill}
          <span style={{ display: "flex", alignItems: "center" }}>
            {item.icon}
          </span>
          <span style={{ flex: 1 }}>{item.name}</span>
          <Chevron open={isOpen} />
        </button>
        <div
          style={{
            maxHeight: isOpen ? `${item.children.length * 42}px` : "0",
            overflow: "hidden",
            transition: "max-height 0.22s",
          }}
        >
          <div
            style={{
              marginLeft: 14,
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {item.children.map((child) => {
              const active = location.pathname === child.path;
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 6,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#3b82f6" : "#64748b",
                    background: active
                      ? "rgba(59,130,246,0.08)"
                      : "transparent",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ display: "flex" }}>{child.icon}</span>
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
    <Link to={item.path} style={baseStyle}>
      {isActive && activePill}
      <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
      {item.name}
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState(() => {
    const init = {};
    menu.forEach((item) => {
      if (item.children?.some((c) => location.pathname === c.path))
        init[item.path || item.name] = true;
    });
    return init;
  });

  const toggle = (path) =>
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));

  return (
    <div
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#060d1f",
        padding: "24px 12px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: "#f1f5f9" }}>UniConnect Admin</h2>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {menu.map((item) => (
          <NavItem
            key={item.path || item.name}
            item={item}
            isOpen={!!openMenus[item.path || item.name]}
            onToggle={() => toggle(item.path || item.name)}
          />
        ))}
      </nav>
    </div>
  );
}
