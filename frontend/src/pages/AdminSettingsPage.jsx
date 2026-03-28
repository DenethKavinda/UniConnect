import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";

function AdminSettingsPage() {
  const { theme, setTheme, isDark } = useAdminTheme();

  const pageBg = isDark
    ? "linear-gradient(135deg, #050b19 0%, #0b1224 55%, #101e39 100%)"
    : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #e2e8f0 100%)";

  const cardBg = isDark
    ? "linear-gradient(135deg, #0f172a, #101e39)"
    : "linear-gradient(135deg, #ffffff, #f8fafc)";

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
          background: pageBg,
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
            style={{
              maxWidth: "640px",
              background: cardBg,
              border: `1px solid ${isDark ? "#1e293b" : "#cbd5e1"}`,
              borderRadius: "1.25rem",
              padding: "1.4rem 1.6rem",
              boxShadow: isDark
                ? "0 6px 24px rgba(0,0,0,0.28)"
                : "0 8px 24px rgba(15,23,42,0.08)",
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
                style={{
                  display: "inline-flex",
                  background: isDark ? "#0b1224" : "#e2e8f0",
                  border: `1px solid ${isDark ? "#1e293b" : "#cbd5e1"}`,
                  borderRadius: "999px",
                  padding: "4px",
                  gap: "4px",
                }}
              >
                <button
                  onClick={() => setTheme("light")}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: theme === "light" ? "#ffffff" : "transparent",
                    color: theme === "light" ? "#0f172a" : isDark ? "#94a3b8" : "#64748b",
                  }}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: theme === "dark" ? "#0f172a" : "transparent",
                    color: theme === "dark" ? "#e2e8f0" : isDark ? "#94a3b8" : "#64748b",
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
