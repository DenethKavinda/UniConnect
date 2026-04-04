import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";
import { FiRefreshCw, FiShield, FiUserCheck, FiUserX, FiUsers } from "react-icons/fi";
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

function withAlpha(hex, alpha) {
  if (typeof hex !== "string" || !hex.startsWith("#")) return hex;
  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function AdminCard({ title, subtitle, t, children, right }) {
  return (
    <section
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "1.25rem",
        padding: "1.2rem 1.35rem",
        boxShadow: t.shadow,
      }}
    >
      {(title || subtitle || right) && (
        <div
          className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
          style={{ marginBottom: "0.9rem" }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: t.text }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: "0.84rem", color: t.textSubtle, marginTop: "0.15rem" }}>
                {subtitle}
              </p>
            )}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

function StatCard({ label, value, accent, icon, hint, t }) {
  return (
    <div
      className="transition-transform duration-150 hover:-translate-y-0.5"
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "1.25rem",
        padding: "1.2rem 1.35rem",
        boxShadow: t.shadow,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
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
        <div>
          <p
            style={{
              fontSize: "0.76rem",
              color: t.textMuted,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </p>
          {hint ? (
            <p style={{ fontSize: "0.82rem", color: t.textSubtle, marginTop: "0.15rem" }}>
              {hint}
            </p>
          ) : null}
        </div>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: withAlpha(accent, 0.12),
            color: accent,
            border: `1px solid ${withAlpha(accent, 0.25)}`,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>
      <h3
        style={{
          fontSize: "2rem",
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
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/admin/users");

      const usersData = Array.isArray(res.data)
        ? res.data
        : res.data.users || res.data.data || [];

      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setIsLoading(false);
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

  const signupByWeekdayData = (() => {
    const counts = new Array(7).fill(0);
    users.forEach((u) => {
      if (!u?.createdAt) return;
      const created = new Date(u.createdAt);
      if (Number.isNaN(created.getTime())) return;
      counts[created.getDay()] += 1;
    });
    return WEEK_DAYS.map((day, i) => ({ day, signups: counts[i] }));
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
        <main className="p-5 sm:p-7" style={{ flex: 1 }}>
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" style={{ marginBottom: "1.4rem" }}>
            <div>
              <p style={{ fontSize: "0.78rem", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Admin Console
              </p>
              <h2
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 900,
                  color: t.text,
                  letterSpacing: "-0.03em",
                  marginTop: "0.15rem",
                }}
              >
                Dashboard
              </h2>
              <p style={{ fontSize: "0.86rem", color: t.textSubtle, marginTop: "0.25rem" }}>
                Snapshot of user registrations and account status.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
              style={{
                background: t.surfaceMuted,
                border: `1px solid ${t.border}`,
                color: t.text,
              }}
              aria-label="Refresh dashboard"
              title="Refresh"
            >
              <FiRefreshCw />
              {isLoading ? "Refreshing" : "Refresh"}
            </button>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ marginBottom: "1.4rem" }}>
            <StatCard
              label="Total Users"
              value={isLoading ? "—" : totalUsers}
              accent={t.accent}
              icon={<FiUsers />}
              hint="All accounts"
              t={t}
            />
            <StatCard
              label="Admins"
              value={isLoading ? "—" : totalAdmins}
              accent={t.purple}
              icon={<FiShield />}
              hint="Privileged"
              t={t}
            />
            <StatCard
              label="Active Users"
              value={isLoading ? "—" : activeUsers}
              accent={t.green}
              icon={<FiUserCheck />}
              hint="Not blocked"
              t={t}
            />
            <StatCard
              label="Blocked Users"
              value={isLoading ? "—" : blockedUsers}
              accent={t.red}
              icon={<FiUserX />}
              hint="Restricted"
              t={t}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12" style={{ marginBottom: "1.4rem" }}>
            <div className="xl:col-span-5">
              <AdminCard title="User Growth" subtitle="Cumulative registrations (last 7 months)" t={t}>
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
              </AdminCard>
            </div>

            <div className="xl:col-span-5">
              <AdminCard title="Registrations by Weekday" subtitle="New user signups (based on created date)" t={t}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={signupByWeekdayData} barSize={18}>
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
                  <Bar dataKey="signups" fill={t.purple} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              </AdminCard>
            </div>

            <div className="xl:col-span-2">
              <AdminCard title="User Breakdown" subtitle="Active vs Blocked vs Admin" t={t}>
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
              </AdminCard>
            </div>
          </div>

          <AdminCard
            title="Recent Users"
            subtitle="Most recently created accounts"
            t={t}
            right={
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
                Showing 5
              </span>
            }
          >

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
                        (e.currentTarget.style.background = withAlpha(t.accent, 0.06))
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
                              background: `linear-gradient(135deg, ${withAlpha(
                                t.accent,
                                0.18
                              )}, ${withAlpha(t.purple, 0.18)})`,
                              border: `1px solid ${t.border}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.78rem",
                              color: t.accent,
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
                                  background: withAlpha(t.red, 0.12),
                                  border: `1px solid ${withAlpha(t.red, 0.35)}`,
                                  color: t.red,
                                }
                              : {
                                  background: withAlpha(t.green, 0.12),
                                  border: `1px solid ${withAlpha(t.green, 0.35)}`,
                                  color: t.green,
                                }),
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: user.isBlocked ? t.red : t.green,
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
                          color: t.textSubtle,
                        }}
                      >
                        {isLoading ? "Loading users…" : "No users found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
