import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";

function AdminSettingsPage() {
  const { theme, setTheme, isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);

  const activeBtnStyles = {
    border: "none",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  };

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
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.25rem" }}>
              Settings
            </h2>
            <p style={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#475569" }}>
              Personalize your admin panel experience
            </p>
          </div>

          <div
            className="admin-panel-card"
            style={{
              maxWidth: "640px",
              background: t.surface,
              padding: "1.4rem 1.6rem",
              boxShadow: t.shadow,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Theme Mode
                </h3>
                <p style={{ fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                  Switch between dark mode and light mode for the admin panel
                </p>
              </div>

              <div
                className="admin-pill-toggle"
                style={{
                  display: "inline-flex",
                  background: t.surfaceMuted,
                }}
              >
                <button
                  onClick={() => setTheme("light")}
                  style={{
                    ...activeBtnStyles,
                    background: theme === "light" ? "#ffffff" : "transparent",
                    color: theme === "light" ? "#0f172a" : t.textMuted,
                  }}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  style={{
                    ...activeBtnStyles,
                    background: theme === "dark" ? "#0f172a" : "transparent",
                    color: theme === "dark" ? "#e2e8f0" : t.textMuted,
                  }}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
