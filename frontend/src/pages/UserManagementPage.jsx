import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function swalAdminBase(t) {
  return {
    background: t.surfaceMuted,
    color: t.text,
    cancelButtonColor: "#64748b",
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.border = `1px solid ${t.border}`;
        popup.style.borderRadius = "12px";
      }
    },
  };
}

function Avatar({ name, t }) {
  return (
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #2dd4bf33, #818cf833)",
        border: `1px solid ${t.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.78rem",
        color: t.accent,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

function StatusBadge({ isBlocked, t }) {
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
              color: t.red,
            }
          : {
              background: "#052e1640",
              border: "1px solid #14532d",
              color: t.green,
            }),
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isBlocked ? t.red : t.green,
        }}
      />
      {isBlocked ? "Blocked" : "Active"}
    </span>
  );
}

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
  const t = getAdminTheme(isDark);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole, userName, previousRole) => {
    if (newRole === previousRole) return;

    const safeName = escapeHtml(userName);
    const prevLabel =
      previousRole === "admin" ? "Admin" : previousRole === "student" ? "Student" : previousRole;
    const nextLabel =
      newRole === "admin" ? "Admin" : newRole === "student" ? "Student" : newRole;

    const result = await Swal.fire({
      ...swalAdminBase(t),
      icon: "question",
      title: "Change role?",
      html: `Change <strong>${safeName}</strong>&rsquo;s role from <strong>${prevLabel}</strong> to <strong>${nextLabel}</strong>?`,
      showCancelButton: true,
      confirmButtonText: "Update role",
      cancelButtonText: "Cancel",
      confirmButtonColor: t.accent,
    });

    if (!result.isConfirmed) return;

    try {
      await API.put(`/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (roleError) {
      Swal.fire({
        ...swalAdminBase(t),
        icon: "error",
        title: "Role update failed",
        text: roleError.response?.data?.message || "Could not update role.",
        confirmButtonColor: t.red,
      });
    }
  };

  const handleBlockToggle = async (id, isBlocked, userName) => {
    const willBlock = !isBlocked;

    const safeName = escapeHtml(userName);
    const result = await Swal.fire({
      ...swalAdminBase(t),
      icon: willBlock ? "warning" : "question",
      title: willBlock ? "Block this user?" : "Unblock this user?",
      html: willBlock
        ? `<strong>${safeName}</strong> will not be able to sign in until you unblock them.`
        : `<strong>${safeName}</strong> will be able to sign in again.`,
      showCancelButton: true,
      confirmButtonText: willBlock ? "Block" : "Unblock",
      cancelButtonText: "Cancel",
      confirmButtonColor: willBlock ? "#f59e0a" : t.green,
    });

    if (!result.isConfirmed) return;

    try {
      await API.put(`/admin/users/${id}/block`, { isBlocked: willBlock });
      fetchUsers();
    } catch (blockError) {
      Swal.fire({
        ...swalAdminBase(t),
        icon: "error",
        title: "Status update failed",
        text: blockError.response?.data?.message || "Could not update status.",
        confirmButtonColor: t.red,
      });
    }
  };

  const handleDelete = async (id, userName) => {
    const safeName = escapeHtml(userName);
    const result = await Swal.fire({
      ...swalAdminBase(t),
      icon: "warning",
      title: "Delete user?",
      html: `This will permanently remove <strong>${safeName}</strong> and cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: t.red,
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (deleteError) {
      Swal.fire({
        ...swalAdminBase(t),
        icon: "error",
        title: "Delete failed",
        text: deleteError.response?.data?.message || "Could not delete user.",
        confirmButtonColor: t.red,
      });
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
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: t.text,
                letterSpacing: "-0.03em",
                marginBottom: "0.25rem",
              }}
            >
              User Management
            </h2>
            <p style={{ fontSize: "0.83rem", color: t.textSubtle }}>
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
              { label: "Total", value: totalUsers, color: t.accent },
              { label: "Active", value: activeUsers, color: t.green },
              { label: "Blocked", value: blockedUsers, color: t.red },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: t.surfaceMuted,
                  border: `1px solid ${t.border}`,
                  borderRadius: "999px",
                  padding: "0.4rem 1rem",
                  fontSize: "0.8rem",
                }}
              >
                <span style={{ color: t.textMuted }}>{label}</span>
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
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.65rem",
                  paddingBottom: "0.65rem",
                  borderRadius: "0.85rem",
                  border: `1px solid ${t.border}`,
                  background: t.surfaceMuted,
                  color: t.text,
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
                border: `1px solid ${t.border}`,
                background: t.surfaceMuted,
                color: t.text,
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
                border: `1px solid ${t.border}`,
                background: t.surfaceMuted,
                color: t.text,
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
                color: t.textSubtle,
                whiteSpace: "nowrap",
              }}
            >
              {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: "1.25rem",
              boxShadow: t.shadow,
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
                  <tr style={{ background: t.surfaceMuted }}>
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
                          color: t.textSubtle,
                          borderBottom: `1px solid ${t.border}`,
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
                          color: t.textMuted,
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
                          color: t.red,
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
                              ? `1px solid ${t.border}`
                              : "none",
                          transition: "background 0.15s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = isDark ? "#101e3980" : "#f1f5f980")
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
                            <Avatar name={user.name} t={t} />
                            <span style={{ color: t.text, fontWeight: 600 }}>
                              {user.name}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: "0.9rem 1.1rem", color: t.textMuted }}>
                          {user.email}
                        </td>

                        <td style={{ padding: "0.9rem 1.1rem" }}>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(
                                user._id,
                                e.target.value,
                                user.name,
                                user.role
                              )
                            }
                            style={{
                              padding: "0.35rem 0.75rem",
                              borderRadius: "0.6rem",
                              border: `1px solid ${t.border}`,
                              background: t.surfaceMuted,
                              color: user.role === "admin" ? t.purple : t.textMuted,
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
                          <StatusBadge isBlocked={user.isBlocked} t={t} />
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
                                handleBlockToggle(user._id, user.isBlocked, user.name)
                              }
                              color={user.isBlocked ? "green" : "yellow"}
                            >
                              {user.isBlocked ? "Unblock" : "Block"}
                            </ActionBtn>

                            <ActionBtn
                              onClick={() => handleDelete(user._id, user.name)}
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
                          color: t.textSubtle,
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
