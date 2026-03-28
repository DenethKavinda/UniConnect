import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";

// Avatar with initials
function Avatar({ name }) {
  return (
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #2dd4bf33, #818cf833)",
        border: "1px solid #1e293b",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.78rem",
        color: "#2dd4bf",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

// Status badge
function StatusBadge({ isBlocked }) {
  return (
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
        ...(isBlocked
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
          background: isBlocked ? "#f87171" : "#34d399",
        }}
      />
      {isBlocked ? "Blocked" : "Active"}
    </span>
  );
}

// Action button
function ActionBtn({ onClick, color, children }) {
  const colors = {
    yellow: {
      bg: "#78350f40",
      border: "#92400e",
      text: "#fbbf24",
      hover: "#78350f70",
    },
    green: {
      bg: "#052e1640",
      border: "#14532d",
      text: "#34d399",
      hover: "#052e1680",
    },
    red: {
      bg: "#450a0a40",
      border: "#7f1d1d",
      text: "#f87171",
      hover: "#450a0a80",
    },
  };

  const c = colors[color];

  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.35rem 0.9rem",
        borderRadius: "0.6rem",
        fontSize: "0.76rem",
        fontWeight: 700,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
        cursor: "pointer",
        transition: "background 0.15s, transform 0.1s",
        letterSpacing: "0.03em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = c.hover;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = c.bg;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
}

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isDark } = useAdminTheme();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Role update failed");
    }
  };

  const handleBlockToggle = async (id, isBlocked) => {
    try {
      await API.put(`/admin/users/${id}/block`, { isBlocked: !isBlocked });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchRole = filterRole === "all" || user.role === filterRole;

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !user.isBlocked) ||
      (filterStatus === "blocked" && user.isBlocked);

    return matchSearch && matchRole && matchStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.isBlocked).length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;
  const pageBg = isDark
    ? "linear-gradient(135deg, #050b19 0%, #0b1224 55%, #101e39 100%)"
    : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #e2e8f0 100%)";

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
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-0.03em",
                marginBottom: "0.25rem",
              }}
            >
              User Management
            </h2>
            <p style={{ fontSize: "0.83rem", color: "#64748b" }}>
              Manage users, roles, and account status
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Total", value: totalUsers, color: "#2dd4bf" },
              { label: "Active", value: activeUsers, color: "#34d399" },
              { label: "Blocked", value: blockedUsers, color: "#f87171" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "999px",
                  padding: "0.4rem 1rem",
                  fontSize: "0.8rem",
                }}
              >
                <span style={{ color: "#94a3b8" }}>{label}</span>
                <span
                  style={{
                    color,
                    fontWeight: 800,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 380 }}>
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.65rem",
                  paddingBottom: "0.65rem",
                  borderRadius: "0.85rem",
                  border: "1px solid #1e293b",
                  background: "#0f172a",
                  color: "#f1f5f9",
                  fontSize: "0.85rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: "0.65rem 1rem",
                borderRadius: "0.85rem",
                border: "1px solid #1e293b",
                background: "#0f172a",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "0.65rem 1rem",
                borderRadius: "0.85rem",
                border: "1px solid #1e293b",
                background: "#0f172a",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>

            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.78rem",
                color: "#475569",
                whiteSpace: "nowrap",
              }}
            >
              {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #0f172a, #101e39)",
              border: "1px solid #1e293b",
              borderRadius: "1.25rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#0b1224" }}>
                    {["User", "Email", "Role", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.85rem 1.1rem",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: "0.73rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#64748b",
                          borderBottom: "1px solid #1e293b",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "3rem",
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "3rem",
                          textAlign: "center",
                          color: "#f87171",
                        }}
                      >
                        {error}
                      </td>
                    </tr>
                  ) : filteredUsers.length ? (
                    filteredUsers.map((user, idx) => (
                      <tr
                        key={user._id}
                        style={{
                          borderBottom:
                            idx < filteredUsers.length - 1
                              ? "1px solid #1e293b"
                              : "none",
                          transition: "background 0.15s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#101e3980")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td style={{ padding: "0.9rem 1.1rem" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.7rem",
                            }}
                          >
                            <Avatar name={user.name} />
                            <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                              {user.name}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: "0.9rem 1.1rem", color: "#94a3b8" }}>
                          {user.email}
                        </td>

                        <td style={{ padding: "0.9rem 1.1rem" }}>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            style={{
                              padding: "0.35rem 0.75rem",
                              borderRadius: "0.6rem",
                              border: "1px solid #1e293b",
                              background: "#0b1224",
                              color: user.role === "admin" ? "#818cf8" : "#94a3b8",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              outline: "none",
                              cursor: "pointer",
                              textTransform: "capitalize",
                            }}
                          >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td style={{ padding: "0.9rem 1.1rem" }}>
                          <StatusBadge isBlocked={user.isBlocked} />
                        </td>

                        <td style={{ padding: "0.9rem 1.1rem" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <ActionBtn
                              onClick={() =>
                                handleBlockToggle(user._id, user.isBlocked)
                              }
                              color={user.isBlocked ? "green" : "yellow"}
                            >
                              {user.isBlocked ? "Unblock" : "Block"}
                            </ActionBtn>

                            <ActionBtn
                              onClick={() => handleDelete(user._id)}
                              color="red"
                            >
                              Delete
                            </ActionBtn>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "3rem",
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

export default UserManagementPage;