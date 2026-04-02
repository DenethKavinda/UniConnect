import { useEffect, useState } from "react";
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

<<<<<<< HEAD
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatCard({ label, value, accent, icon, t }) {
=======
// mock trend data
const userGrowthData = [
  { month: "Jan", users: 40 },
  { month: "Feb", users: 68 },
  { month: "Mar", users: 95 },
  { month: "Apr", users: 120 },
  { month: "May", users: 148 },
  { month: "Jun", users: 175 },
  { month: "Jul", users: 210 },
];

const activityData = [
  { day: "Mon", logins: 30 },
  { day: "Tue", logins: 52 },
  { day: "Wed", logins: 45 },
  { day: "Thu", logins: 70 },
  { day: "Fri", logins: 63 },
  { day: "Sat", logins: 28 },
  { day: "Sun", logins: 18 },
];

// tiny reusable stat card
function StatCard({ label, value, accent, icon }) {
>>>>>>> member2-materials
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "1.25rem",
        padding: "1.4rem 1.6rem",
<<<<<<< HEAD
        boxShadow: t.shadow,
=======
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
>>>>>>> member2-materials
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.18s, box-shadow 0.18s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 8px 32px 0 ${accent}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
<<<<<<< HEAD
        e.currentTarget.style.boxShadow = t.shadow;
=======
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)";
>>>>>>> member2-materials
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-28px",
          right: "-28px",
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          background: accent,
          opacity: 0.12,
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />
<<<<<<< HEAD
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.78rem", color: t.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
=======
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: "0.78rem",
            color: "#94a3b8",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
>>>>>>> member2-materials
          {label}
        </p>
        <span style={{ fontSize: "1.3rem" }}>{icon}</span>
      </div>
      <h3
        style={{
          fontSize: "2.2rem",
          fontWeight: 800,
          color: accent,
          lineHeight: 1,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </h3>
    </div>
  );
}

<<<<<<< HEAD
function CustomTooltip({ active, payload, label, t }) {
=======
// custom tooltip for charts
function CustomTooltip({ active, payload, label }) {
>>>>>>> member2-materials
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: t.surfaceMuted,
        border: `1px solid ${t.border}`,
        borderRadius: "0.75rem",
        padding: "0.6rem 1rem",
        fontSize: "0.82rem",
        color: t.text,
      }}
    >
<<<<<<< HEAD
      <p style={{ marginBottom: "0.2rem", color: t.textMuted }}>{label}</p>
      <p style={{ fontWeight: 700, color: payload[0].color }}>{payload[0].value}</p>
=======
      <p style={{ marginBottom: "0.2rem", color: "#94a3b8" }}>{label}</p>
      <p style={{ fontWeight: 700, color: payload[0].color }}>
        {payload[0].value}
      </p>
>>>>>>> member2-materials
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
<<<<<<< HEAD
  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);
=======
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setError("");
      setIsLoading(true);
      const res = await API.get("/admin/users");
      const list = Array.isArray(res?.data) ? res.data : res?.data?.users;
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load users";
      setError(message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };
>>>>>>> member2-materials

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");

      const usersData = Array.isArray(res.data)
        ? res.data
        : res.data.users || res.data.data || [];

      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;
  const activeUsers = users.filter((u) => !u.isBlocked).length;

  const userGrowthData = (() => {
    const now = new Date();
    const lastSevenMonths = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTHS[d.getMonth()], users: 0 };
    });

    users.forEach((u) => {
      if (!u?.createdAt) return;
      const created = new Date(u.createdAt);
      if (Number.isNaN(created.getTime())) return;
      const key = `${created.getFullYear()}-${created.getMonth()}`;
      const bucket = lastSevenMonths.find((m) => m.key === key);
      if (bucket) bucket.users += 1;
    });

    let runningTotal = 0;
    return lastSevenMonths.map(({ month, users: monthUsers }) => {
      runningTotal += monthUsers;
      return { month, users: runningTotal };
    });
  })();

  const activityData = (() => {
    const counts = new Array(7).fill(0);
    users.forEach((u) => {
      if (!u?.createdAt) return;
      const created = new Date(u.createdAt);
      if (Number.isNaN(created.getTime())) return;
      counts[created.getDay()] += 1;
    });
    return WEEK_DAYS.map((day, i) => ({ day, logins: counts[i] }));
  })();

  const pieData = [
    { name: "Active", value: activeUsers },
    { name: "Blocked", value: blockedUsers },
    { name: "Admins", value: totalAdmins },
  ];
<<<<<<< HEAD
  const PIE_COLORS = [t.green, t.red, t.purple];
  const pageBg = t.pageBg;
=======
  const PIE_COLORS = ["#3b82f6", "#f87171", "#eab308"];
>>>>>>> member2-materials

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

<<<<<<< HEAD
      <div
        style={{
          flex: 1,
          background: pageBg,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ padding: "1.75rem 2rem", flex: 1 }}>
=======
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <main className="flex-1 px-6 md:px-8 py-8">
          {/* Header */}
>>>>>>> member2-materials
          <div style={{ marginBottom: "1.75rem" }}>
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: t.text,
                letterSpacing: "-0.03em",
                marginBottom: "0.25rem",
              }}
            >
              Dashboard
            </h2>
            <p style={{ fontSize: "0.83rem", color: t.textSubtle }}>
              Overview of all platform activity and user metrics
            </p>
<<<<<<< HEAD
          </div>

=======
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}
          </div>

          {/* Stat cards */}
>>>>>>> member2-materials
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.1rem",
              marginBottom: "1.75rem",
            }}
          >
<<<<<<< HEAD
            <StatCard label="Total Users" value={totalUsers} accent={t.accent} icon="" t={t} />
            <StatCard label="Admins" value={totalAdmins} accent={t.purple} icon="" t={t} />
            <StatCard label="Active Users" value={activeUsers} accent={t.green} icon="" t={t} />
            <StatCard label="Blocked Users" value={blockedUsers} accent={t.red} icon="" t={t} />
          </div>

=======
            <StatCard label="Total Users" value={totalUsers} accent="#3b82f6" />
            <StatCard label="Admins" value={totalAdmins} accent="#eab308" />
            <StatCard
              label="Active Users"
              value={activeUsers}
              accent="#3b82f6"
            />
            <StatCard
              label="Blocked Users"
              value={blockedUsers}
              accent="#f87171"
            />
          </div>

          {isLoading && (
            <div className="mb-7 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
              Loading admin data…
            </div>
          )}

          {/* Charts */}
>>>>>>> member2-materials
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 300px",
              gap: "1.1rem",
              marginBottom: "1.75rem",
            }}
          >
<<<<<<< HEAD
=======
            {/* Area Chart */}
>>>>>>> member2-materials
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "1.25rem",
                padding: "1.4rem 1.6rem",
                boxShadow: t.shadow,
              }}
            >
<<<<<<< HEAD
              <p style={{ fontSize: "0.78rem", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
=======
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                }}
              >
>>>>>>> member2-materials
                User Growth
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
<<<<<<< HEAD
                      <stop offset="5%" stopColor={t.accent} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={t.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis dataKey="month" tick={{ fill: t.textSubtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: t.textSubtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Area type="monotone" dataKey="users" stroke={t.accent} strokeWidth={2.5} fill="url(#growthGrad)" dot={false} />
=======
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#growthGrad)"
                    dot={false}
                  />
>>>>>>> member2-materials
                </AreaChart>
              </ResponsiveContainer>
            </div>

<<<<<<< HEAD
=======
            {/* Bar Chart */}
>>>>>>> member2-materials
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "1.25rem",
                padding: "1.4rem 1.6rem",
                boxShadow: t.shadow,
              }}
            >
<<<<<<< HEAD
              <p style={{ fontSize: "0.78rem", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
=======
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                }}
              >
>>>>>>> member2-materials
                Weekly Logins
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={activityData} barSize={18}>
<<<<<<< HEAD
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis dataKey="day" tick={{ fill: t.textSubtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: t.textSubtle, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Bar dataKey="logins" fill={t.purple} radius={[6, 6, 0, 0]} />
=======
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="logins" fill="#eab308" radius={[6, 6, 0, 0]} />
>>>>>>> member2-materials
                </BarChart>
              </ResponsiveContainer>
            </div>

<<<<<<< HEAD
=======
            {/* Pie Chart */}
>>>>>>> member2-materials
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "1.25rem",
                padding: "1.4rem 1.6rem",
                boxShadow: t.shadow,
                display: "flex",
                flexDirection: "column",
              }}
            >
<<<<<<< HEAD
              <p style={{ fontSize: "0.78rem", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
=======
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                }}
              >
>>>>>>> member2-materials
                User Breakdown
              </p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip t={t} />} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                  marginTop: "0.75rem",
                }}
              >
                {pieData.map((item, i) => (
<<<<<<< HEAD
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: t.textMuted }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i], flexShrink: 0 }} />
                    <span>{item.name}</span>
                    <span style={{ marginLeft: "auto", color: t.text, fontWeight: 600 }}>{item.value}</span>
=======
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: PIE_COLORS[i],
                        flexShrink: 0,
                      }}
                    />
                    <span>{item.name}</span>
                    <span
                      style={{
                        marginLeft: "auto",
                        color: "#e2e8f0",
                        fontWeight: 600,
                      }}
                    >
                      {item.value}
                    </span>
>>>>>>> member2-materials
                  </div>
                ))}
              </div>
            </div>
          </div>

<<<<<<< HEAD
=======
          {/* Recent Users Table */}
>>>>>>> member2-materials
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "1.25rem",
              padding: "1.4rem 1.6rem",
              boxShadow: t.shadow,
            }}
          >
<<<<<<< HEAD
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: t.text }}>Recent Users</h3>
=======
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.1rem",
              }}
            >
              <h3
                style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9" }}
              >
                Recent Users
              </h3>
>>>>>>> member2-materials
              <span
                style={{
                  fontSize: "0.75rem",
                  color: t.textSubtle,
                  background: t.surfaceMuted,
                  border: `1px solid ${t.border}`,
                  borderRadius: "999px",
                  padding: "0.2rem 0.75rem",
                }}
              >
                Last 5
              </span>
            </div>

<<<<<<< HEAD
            <div style={{ overflowX: "auto", borderRadius: "0.85rem", border: `1px solid ${t.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
=======
            <div
              style={{
                overflowX: "auto",
                borderRadius: "0.85rem",
                border: "1px solid #1e293b",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
>>>>>>> member2-materials
                <thead>
                  <tr style={{ background: t.surfaceMuted, color: t.textMuted }}>
                    {["Name", "Email", "Role", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          borderBottom: `1px solid ${t.border}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map((user) => (
                    <tr
<<<<<<< HEAD
                      key={user._id}
                      style={{ borderBottom: `1px solid ${t.border}`, transition: "background 0.15s", cursor: "default" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#101e39" : "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "0.85rem 1rem", color: t.text, fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
=======
                      key={user._id ?? Math.random()}
                      style={{
                        borderBottom: "1px solid #1e293b",
                        transition: "background 0.15s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#101e39")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "0.85rem 1rem",
                          color: "#f1f5f9",
                          fontWeight: 600,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                          }}
                        >
>>>>>>> member2-materials
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
<<<<<<< HEAD
                              background: "linear-gradient(135deg, #2dd4bf44, #818cf844)",
                              border: `1px solid ${t.border}`,
=======
                              background:
                                "linear-gradient(135deg, #3b82f644, #eab30844)",
                              border: "1px solid #1e293b",
>>>>>>> member2-materials
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.78rem",
                              color: "#2dd4bf",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {user.name?.[0]?.toUpperCase() ?? "?"}
                          </span>
                          {user.name}
                        </div>
                      </td>
<<<<<<< HEAD
                      <td style={{ padding: "0.85rem 1rem", color: t.textMuted }}>{user.email}</td>
                      <td style={{ padding: "0.85rem 1rem", color: t.text, textTransform: "capitalize" }}>{user.role}</td>
=======
                      <td style={{ padding: "0.85rem 1rem", color: "#94a3b8" }}>
                        {user.email}
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 1rem",
                          color: "#cbd5e1",
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role}
                      </td>
>>>>>>> member2-materials
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "999px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            ...(user.isBlocked
                              ? {
                                  background: "#450a0a40",
                                  border: "1px solid #7f1d1d",
                                  color: "#f87171",
                                }
                              : {
                                  background: "#052e1640",
                                  border: "1px solid #14532d",
                                  color: "#34d399",
                                }),
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: user.isBlocked
                                ? "#f87171"
                                : "#34d399",
                            }}
                          />
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          color: "#475569",
                        }}
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
