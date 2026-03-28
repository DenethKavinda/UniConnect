import { useEffect, useMemo, useRef, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";

function toCsv(rows) {
  const escape = (v) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = [
    "Name",
    "Email",
    "Role",
    "Status",
    "Created At",
  ];
  const lines = [headers.map(escape).join(",")];
  rows.forEach((r) => {
    lines.push(
      [
        r.name,
        r.email,
        r.role,
        r.isBlocked ? "Blocked" : "Active",
        r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      ]
        .map(escape)
        .join(",")
    );
  });
  return lines.join("\n");
}

function download(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AdminReportsUserManagement() {
  const { isDark } = useAdminTheme();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const printRef = useRef(null);

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

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchesRole = role === "all" || u.role === role;
      const matchesStatus =
        status === "all" ||
        (status === "active" && !u.isBlocked) ||
        (status === "blocked" && u.isBlocked);
      return matchesQ && matchesRole && matchesStatus;
    });
  }, [users, query, role, status]);

  const totals = {
    total: filtered.length,
    admins: filtered.filter((u) => u.role === "admin").length,
    students: filtered.filter((u) => u.role === "student").length,
    active: filtered.filter((u) => !u.isBlocked).length,
    blocked: filtered.filter((u) => u.isBlocked).length,
  };

  const exportCsv = () => {
    download(
      `user-account-report-${Date.now()}.csv`,
      toCsv(filtered),
      "text/csv;charset=utf-8"
    );
  };

  const printReport = () => {
    const printContents = printRef.current?.innerHTML || "";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>User & Account Management Report</title>
          <style>
            @page { size: A4; margin: 14mm; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .page-break { page-break-after: always; }
            }
            body { font-family: Inter, system-ui, Arial; padding: 0; color: #0f172a; }
            .wrap { padding: 24px; }
            h1 { font-size: 20px; margin: 0 0 8px 0; }
            .muted { color: #475569; font-size: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; vertical-align: top; }
            th { background: #e2e8f0; font-weight: 700; }
            .summary { display: flex; gap: 10px; margin: 8px 0 14px; flex-wrap: wrap; }
            .summary div { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 10px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h1>User & Account Management Report</h1>
            <div class="muted">${new Date().toLocaleString()}</div>
            ${printContents}
          </div>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const cardBorder = isDark ? "#1e293b" : "#cbd5e1";
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
          background: isDark
            ? "linear-gradient(135deg, #050b19 0%, #0b1224 55%, #101e39 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #e2e8f0 100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ padding: "1.75rem 2rem", flex: 1 }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.78rem", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Reports
            </p>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.15rem" }}>
              User & Account Management
            </h2>
          </div>

          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "1.25rem",
              padding: "1.1rem 1.2rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Search name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: "1 1 240px",
                maxWidth: 340,
                background: isDark ? "#0b1224" : "#ffffff",
                border: `1px solid ${cardBorder}`,
                borderRadius: "0.8rem",
                padding: "0.55rem 0.9rem",
                color: "inherit",
                outline: "none",
              }}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                background: isDark ? "#0b1224" : "#ffffff",
                border: `1px solid ${cardBorder}`,
                borderRadius: "0.8rem",
                padding: "0.55rem 0.9rem",
                color: "inherit",
                outline: "none",
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                background: isDark ? "#0b1224" : "#ffffff",
                border: `1px solid ${cardBorder}`,
                borderRadius: "0.8rem",
                padding: "0.55rem 0.9rem",
                color: "inherit",
                outline: "none",
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.6rem" }}>
              <button
                onClick={exportCsv}
                style={{
                  padding: "0.55rem 0.9rem",
                  borderRadius: "0.8rem",
                  border: "1px solid #1e293b",
                  background: isDark ? "#0b1224" : "#ffffff",
                  color: "inherit",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Export CSV
              </button>
              <button
                onClick={printReport}
                style={{
                  padding: "0.55rem 0.9rem",
                  borderRadius: "0.8rem",
                  border: "1px solid #14532d",
                  background: "linear-gradient(135deg, #052e16, #064e3b)",
                  color: "#d1fae5",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Export PDF
              </button>
            </div>
          </div>

          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "1.25rem",
              padding: "1.2rem 1.2rem",
            }}
            ref={printRef}
          >
            <div class="summary" style={{ display: "flex", gap: "0.8rem", marginBottom: "0.9rem", flexWrap: "wrap" }}>
              <div>Totals:</div>
              <div>All: <b>{totals.total}</b></div>
              <div>Admins: <b>{totals.admins}</b></div>
              <div>Students: <b>{totals.students}</b></div>
              <div>Active: <b>{totals.active}</b></div>
              <div>Blocked: <b>{totals.blocked}</b></div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: isDark ? "#0b1224" : "#e2e8f0", color: isDark ? "#94a3b8" : "#0f172a" }}>
                    {["Name", "Email", "Role", "Status", "Created At"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          borderBottom: `1px solid ${cardBorder}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => (
                    <tr
                      key={u._id ?? idx}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? `1px solid ${cardBorder}` : "none",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "0.85rem 1rem" }}>{u.name}</td>
                      <td style={{ padding: "0.85rem 1rem", color: isDark ? "#94a3b8" : "#475569" }}>{u.email}</td>
                      <td style={{ padding: "0.85rem 1rem", textTransform: "capitalize" }}>{u.role}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>{u.isBlocked ? "Blocked" : "Active"}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: isDark ? "#94a3b8" : "#475569" }}>
                        No data
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

export default AdminReportsUserManagement;
