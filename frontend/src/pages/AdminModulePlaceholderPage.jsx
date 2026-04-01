import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";

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
  const t = getAdminTheme(isDark);

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
        background: t.pageBase,
        color: t.text,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          background: t.pageBg,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ padding: "1.75rem 2rem", flex: 1 }}>
          <div
            style={{
              maxWidth: "720px",
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "1.25rem",
              padding: "1.4rem 1.6rem",
              boxShadow: t.shadow,
            }}
          >
            <p style={{ fontSize: "0.75rem", color: t.textMuted, marginBottom: "0.5rem" }}>
              {section}
            </p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.45rem" }}>
              {moduleTitle}
            </h2>
            <p style={{ fontSize: "0.88rem", color: t.textMuted }}>
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
