import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AdminThemeContext = createContext(null);

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("adminTheme") || "dark"
  );

  useEffect(() => {
    localStorage.setItem("adminTheme", theme);
    document.documentElement.setAttribute("data-admin-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme: () =>
        setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return context;
}
