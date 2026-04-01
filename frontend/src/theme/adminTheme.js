export const adminThemeTokens = {
  dark: {
    pageBase: "#050b19",
    pageBg: "linear-gradient(135deg, #050b19 0%, #0b1224 55%, #101e39 100%)",
    surface: "linear-gradient(135deg, #0f172a, #101e39)",
    surfaceMuted: "#0b1224",
    border: "#1e293b",
    text: "#f1f5f9",
    textMuted: "#94a3b8",
    textSubtle: "#64748b",
    accent: "#2dd4bf",
    purple: "#818cf8",
    green: "#34d399",
    red: "#f87171",
    shadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  light: {
    pageBase: "#f1f5f9",
    pageBg: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #e2e8f0 100%)",
    surface: "linear-gradient(135deg, #ffffff, #f8fafc)",
    surfaceMuted: "#ffffff",
    border: "#cbd5e1",
    text: "#0f172a",
    textMuted: "#64748b",
    textSubtle: "#475569",
    accent: "#0ea5e9",
    purple: "#6366f1",
    green: "#059669",
    red: "#dc2626",
    shadow: "0 8px 24px rgba(15,23,42,0.08)",
  },
};

export const getAdminTheme = (isDark) =>
  isDark ? adminThemeTokens.dark : adminThemeTokens.light;
