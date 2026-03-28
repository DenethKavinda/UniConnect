import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";

function formatModuleName(slug) {
  return (slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function AdminModulePlaceholderPage() {
  const location = useLocation();
  const { isDark } = useAdminTheme();

  const { section, moduleTitle } = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const sectionName = parts[1] || "analytics";
    const moduleKey = parts[2] || "module";
    return {
      section:
        sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
      moduleTitle: formatModuleName(moduleKey),
    };
  }, [location.pathname]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: isDark ? "#050b19" : "#f1f5f9",
        color: isDark ? "#f1f5f9" : "#0f172a",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          background: isDark
            ? "linear-gradient(135deg, #050b19 0%, #0b1224 55%, #101e39 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #e2e8f0 100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ padding: "1.75rem 2rem", flex: 1 }}>
          <div
            style={{
              maxWidth: "720px",
              background: isDark
                ? "linear-gradient(135deg, #0f172a, #101e39)"
                : "linear-gradient(135deg, #ffffff, #f8fafc)",
              border: `1px solid ${isDark ? "#1e293b" : "#cbd5e1"}`,
              borderRadius: "1.25rem",
              padding: "1.4rem 1.6rem",
              boxShadow: isDark
                ? "0 6px 24px rgba(0,0,0,0.28)"
                : "0 8px 24px rgba(15,23,42,0.08)",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "0.5rem" }}>
              {section}
            </p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.45rem" }}>
              {moduleTitle}
            </h2>
            <p style={{ fontSize: "0.88rem", color: isDark ? "#94a3b8" : "#64748b" }}>
              This section is ready for your {section.toLowerCase()} data integration.
              You can connect charts, KPIs, and reports here without redirecting to login.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminModulePlaceholderPage;
