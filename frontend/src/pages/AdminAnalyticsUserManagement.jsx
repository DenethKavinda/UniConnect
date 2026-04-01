import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatPill({ label, value, color }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(148,163,184,0.18)",
        borderRadius: "999px",
        padding: "0.45rem 0.9rem",
        marginRight: "0.6rem",
      }}
    >
      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{label}</span>
      <span
        style={{
          color,
          fontWeight: 800,
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.9rem",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function AdminAnalyticsUserManagement() {
  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/admin/users");
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.users || res.data.data || [];
        setUsers(list);
      } catch (e) {
        setUsers([]);
      }
    })();
  }, []);

  const colors = {
    accent: t.accent,
    purple: t.purple,
    green: t.green,
    red: t.red,
    textMute: t.textMuted,
    cardBorder: t.border,
    cardBg: t.surface,
    pageBg: t.pageBg,
    pageBase: t.pageBase,
    textBase: t.text,
  };

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const activeUsers = users.filter((u) => !u.isBlocked).length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const growthData = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTHS[d.getMonth()], count: 0 };
    });
    users.forEach((u) => {
      if (!u?.createdAt) return;
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) b.count += 1;
    });
    let cum = 0;
    return buckets.map(({ month, count }) => {
      cum += count;
      return { month, users: cum };
    });
  }, [users]);

  const roleData = useMemo(
    () => [
      { role: "Admin", count: totalAdmins },
      { role: "Student", count: totalUsers - totalAdmins },
    ],
    [totalUsers, totalAdmins]
  );

  const statusPie = [
    { name: "Active", value: activeUsers, color: colors.green },
    { name: "Blocked", value: blockedUsers, color: colors.red },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: colors.pageBase,
        color: colors.textBase,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          background: colors.pageBg,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ padding: "1.75rem 2rem", flex: 1 }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.78rem", color: colors.textMute, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Analytics
            </p>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.15rem" }}>
              User & Account Management
            </h2>
            <div style={{ marginTop: "0.75rem" }}>
              <StatPill label="Total" value={totalUsers} color={colors.accent} />
              <StatPill label="Active" value={activeUsers} color={colors.green} />
              <StatPill label="Blocked" value={blockedUsers} color={colors.red} />
              <StatPill label="Admins" value={totalAdmins} color={colors.purple} />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 320px",
              gap: "1.1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: "1.25rem",
                padding: "1.4rem 1.6rem",
                boxShadow: t.shadow,
              }}
            >
              <p style={{ fontSize: "0.78rem", color: colors.textMute, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                Growth (Last 7 months)
              </p>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="uaGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.accent} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="month" tick={{ fill: colors.textMute, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: colors.textMute, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? "#0f172a" : "#ffffff",
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: "0.5rem",
                      color: colors.textBase,
                      fontSize: "0.82rem",
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke={colors.accent} strokeWidth={2.4} fill="url(#uaGrowth)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: "1.25rem",
                padding: "1.4rem 1.6rem",
                boxShadow: t.shadow,
              }}
            >
              <p style={{ fontSize: "0.78rem", color: colors.textMute, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                Role Distribution
              </p>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={roleData} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="role" tick={{ fill: colors.textMute, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: colors.textMute, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? "#0f172a" : "#ffffff",
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: "0.5rem",
                      color: colors.textBase,
                      fontSize: "0.82rem",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={colors.purple} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: "1.25rem",
                padding: "1.4rem 1.6rem",
                boxShadow: t.shadow,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p style={{ fontSize: "0.78rem", color: colors.textMute, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
                Status Breakdown
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value">
                    {statusPie.map((item, i) => (
                      <Cell key={i} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: isDark ? "#0f172a" : "#ffffff",
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: "0.5rem",
                      color: colors.textBase,
                      fontSize: "0.82rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginTop: "0.75rem" }}>
                {statusPie.map((item) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: colors.textMute }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span>{item.name}</span>
                    <span style={{ marginLeft: "auto", color: colors.textBase, fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminAnalyticsUserManagement;
