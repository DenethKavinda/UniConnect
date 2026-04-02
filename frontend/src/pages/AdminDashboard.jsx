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

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatCard({ label, value, accent, icon, t }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "1.25rem",
        padding: "1.4rem 1.6rem",
        boxShadow: t.shadow,
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
        e.currentTarget.style.boxShadow = t.shadow;
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
            color: t.textMuted,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
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

function CustomTooltip({ active, payload, label, t }) {
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
      <p style={{ marginBottom: "0.2rem", color: t.textMuted }}>{label}</p>
      <p style={{ fontWeight: 700, color: payload[0].color }}>
        {payload[0].value}
      </p>
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);

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
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: MONTHS[d.getMonth()],
        users: 0,
      };
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
  const PIE_COLORS = [t.green, t.red, t.purple];
  const pageBg = t.pageBg;

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
          background: pageBg,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ padding: "1.75rem 2rem", flex: 1 }}>
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
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.1rem",
              marginBottom: "1.75rem",
            }}
          >
            <StatCard
              label="Total Users"
              value={totalUsers}
              accent={t.accent}
              icon=""
              t={t}
            />
            <StatCard
              label="Admins"
              value={totalAdmins}
              accent={t.purple}
              icon=""
              t={t}
            />
            <StatCard
              label="Active Users"
              value={activeUsers}
              accent={t.green}
              icon=""
              t={t}
            />
            <StatCard
              label="Blocked Users"
              value={blockedUsers}
              accent={t.red}
              icon=""
              t={t}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 300px",
              gap: "1.1rem",
              marginBottom: "1.75rem",
            }}
          >
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "1.25rem",
                padding: "1.4rem 1.6rem",
                boxShadow: t.shadow,
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                }}
              >
                User Growth
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={t.accent}
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor={t.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: t.textSubtle, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: t.textSubtle, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke={t.accent}
                    strokeWidth={2.5}
                    fill="url(#growthGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "1.25rem",
                padding: "1.4rem 1.6rem",
                boxShadow: t.shadow,
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                }}
              >
                Weekly Logins
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={activityData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: t.textSubtle, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: t.textSubtle, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Bar dataKey="logins" fill={t.purple} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

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
              <p
                style={{
                  fontSize: "0.78rem",
                  color: t.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                }}
              >
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
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.8rem",
                      color: t.textMuted,
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
                        color: t.text,
                        fontWeight: 600,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "1.25rem",
              padding: "1.4rem 1.6rem",
              boxShadow: t.shadow,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.1rem",
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: t.text }}>
                Recent Users
              </h3>
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

            <div
              style={{
                overflowX: "auto",
                borderRadius: "0.85rem",
                border: `1px solid ${t.border}`,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr
                    style={{ background: t.surfaceMuted, color: t.textMuted }}
                  >
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
                      key={user._id}
                      style={{
                        borderBottom: `1px solid ${t.border}`,
                        transition: "background 0.15s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDark
                          ? "#101e39"
                          : "#f1f5f9")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "0.85rem 1rem",
                          color: t.text,
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
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #2dd4bf44, #818cf844)",
                              border: `1px solid ${t.border}`,
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
                      <td
                        style={{ padding: "0.85rem 1rem", color: t.textMuted }}
                      >
                        {user.email}
                      </td>
                      <td
                        style={{
                          padding: "0.85rem 1rem",
                          color: t.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role}
                      </td>
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
