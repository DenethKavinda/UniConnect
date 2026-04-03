import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";

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

function Stars({ n, t }) {
  return (
    <span style={{ color: t.accent, fontSize: "0.85rem", letterSpacing: "0.05em" }}>
      {"★".repeat(n)}
      <span style={{ color: t.textMuted }}>{"☆".repeat(5 - n)}</span>
    </span>
  );
}

function ActionBtn({ onClick, color, children }) {
  const colors = {
    yellow: { bg: "#78350f40", border: "#92400e", text: "#fbbf24", hover: "#78350f70" },
    green: { bg: "#052e1640", border: "#14532d", text: "#34d399", hover: "#052e1680" },
    red: { bg: "#450a0a40", border: "#7f1d1d", text: "#f87171", hover: "#450a0a80" },
    blue: { bg: "#0c4a6e40", border: "#0369a1", text: "#38bdf8", hover: "#0c4a6e70" },
  };
  const c = colors[color];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "0.35rem 0.75rem",
        borderRadius: "0.6rem",
        fontSize: "0.72rem",
        fontWeight: 700,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function AdminFeedbackPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/feedback");
      setItems(res.data.feedback || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load feedback");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleVisible = async (row) => {
    const next = !row.visibleToUsers;
    const result = await Swal.fire({
      ...swalAdminBase(t),
      icon: "question",
      title: next ? "Show to users?" : "Hide from users?",
      text: next
        ? "This feedback will appear on the student community list."
        : "Students will no longer see this entry in the public list.",
      showCancelButton: true,
      confirmButtonColor: next ? t.green : "#f59e0a",
    });
    if (!result.isConfirmed) return;
    try {
      await API.patch(`/admin/feedback/${row._id}`, { visibleToUsers: next });
      await load();
    } catch (e) {
      Swal.fire({
        ...swalAdminBase(t),
        icon: "error",
        title: "Update failed",
        text: e.response?.data?.message || "Try again",
        confirmButtonColor: t.red,
      });
    }
  };

  const deleteRow = async (row) => {
    const result = await Swal.fire({
      ...swalAdminBase(t),
      icon: "warning",
      title: "Delete feedback?",
      text: "This cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: t.red,
    });
    if (!result.isConfirmed) return;
    try {
      await API.delete(`/admin/feedback/${row._id}`);
      await load();
    } catch (e) {
      Swal.fire({
        ...swalAdminBase(t),
        icon: "error",
        title: "Delete failed",
        text: e.response?.data?.message || "Try again",
        confirmButtonColor: t.red,
      });
    }
  };

  const filtered = items.filter((f) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = f.user?.name || "";
    const email = f.user?.email || "";
    return (
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      (f.message || "").toLowerCase().includes(q)
    );
  });

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
      <div style={{ flex: 1, background: pageBg, display: "flex", flexDirection: "column" }}>
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
              Feedback & ratings
            </h2>
            <p style={{ fontSize: "0.83rem", color: t.textSubtle }}>
              View student feedback and ratings, show or hide entries on the community list, or
              delete entries. Message and rating text cannot be changed after submission.
            </p>
          </div>

          <input
            type="search"
            placeholder="Search by user, email, or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 400,
              marginBottom: "1.25rem",
              padding: "0.65rem 1rem",
              borderRadius: "0.85rem",
              border: `1px solid ${t.border}`,
              background: t.surfaceMuted,
              color: t.text,
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

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
                  fontSize: "0.82rem",
                }}
              >
                <thead>
                  <tr style={{ background: t.surfaceMuted }}>
                    {["User", "Rating", "Message", "Visibility", "Date", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.85rem 1rem",
                          textAlign: "left",
                          fontWeight: 600,
                          fontSize: "0.7rem",
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
                      <td colSpan={6} style={{ padding: "2.5rem", textAlign: "center", color: t.textMuted }}>
                        Loading…
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "2.5rem", textAlign: "center", color: t.red }}>
                        {error}
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "2.5rem", textAlign: "center", color: t.textSubtle }}>
                        No feedback yet.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((f, idx) => (
                      <tr
                        key={f._id}
                        style={{
                          borderBottom:
                            idx < filtered.length - 1 ? `1px solid ${t.border}` : "none",
                        }}
                      >
                        <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 600 }}>{f.user?.name || "—"}</div>
                          <div style={{ fontSize: "0.75rem", color: t.textMuted }}>{f.user?.email}</div>
                          <div style={{ fontSize: "0.7rem", color: t.textSubtle, marginTop: "0.2rem" }}>
                            {f.user?.role}
                          </div>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                          <Stars n={f.rating} t={t} />
                        </td>
                        <td
                          style={{
                            padding: "0.85rem 1rem",
                            maxWidth: 320,
                            color: t.textMuted,
                            verticalAlign: "top",
                            lineHeight: 1.45,
                            wordBreak: "break-word",
                          }}
                        >
                          {f.message}
                        </td>
                        <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "0.25rem 0.65rem",
                              borderRadius: "999px",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              ...(f.visibleToUsers
                                ? {
                                    background: "#052e1640",
                                    border: "1px solid #14532d",
                                    color: t.green,
                                  }
                                : {
                                    background: "#78350f40",
                                    border: "1px solid #92400e",
                                    color: "#fbbf24",
                                  }),
                            }}
                          >
                            {f.visibleToUsers ? "Public" : "Hidden"}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1rem", color: t.textMuted, verticalAlign: "top", whiteSpace: "nowrap" }}>
                          {f.createdAt ? new Date(f.createdAt).toLocaleString() : "—"}
                        </td>
                        <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            <ActionBtn
                              onClick={() => toggleVisible(f)}
                              color={f.visibleToUsers ? "yellow" : "green"}
                            >
                              {f.visibleToUsers ? "Hide" : "Show"}
                            </ActionBtn>
                            <ActionBtn onClick={() => deleteRow(f)} color="red">
                              Delete
                            </ActionBtn>
                          </div>
                        </td>
                      </tr>
                    ))
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

export default AdminFeedbackPage;
