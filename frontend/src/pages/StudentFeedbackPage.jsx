import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiStar } from "react-icons/fi";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

function StarInput({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className="p-1 rounded-lg transition-transform hover:scale-110 disabled:opacity-50"
          aria-label={`${n} stars`}
        >
          <FiStar
            className={`w-8 h-8 ${
              n <= value ? "text-amber-400 fill-amber-400" : "text-slate-600"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-slate-400">{value} / 5</span>
    </div>
  );
}

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          className={`w-4 h-4 ${n <= rating ? "fill-amber-400" : "text-slate-600 fill-none"}`}
        />
      ))}
    </div>
  );
}

function StudentFeedbackPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [publicList, setPublicList] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [editRating, setEditRating] = useState(5);

  const load = async () => {
    try {
      const [pub, my] = await Promise.all([
        API.get("/feedback/public"),
        API.get("/feedback/mine"),
      ]);
      setPublicList(pub.data.feedback || []);
      setMine(my.data.feedback || []);
    } catch (e) {
      console.error(e);
      setPublicList([]);
      setMine([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** Admin-hidden feedback stays in “Your submissions” but must not stay in edit mode. */
  useEffect(() => {
    if (!editingId) return;
    const row = mine.find((x) => x._id === editingId);
    if (row && row.visibleToUsers === false) {
      setEditingId(null);
    }
  }, [mine, editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = message.trim();
    if (msg.length < 10) {
      Swal.fire({
        icon: "warning",
        title: "A bit more detail",
        text: "Please write at least 10 characters of feedback.",
        confirmButtonColor: "#f59e0b",
        background: "#0f172a",
        color: "#f1f5f9",
      });
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/feedback", { message: msg, rating });
      setMessage("");
      setRating(5);
      await load();
      Swal.fire({
        icon: "success",
        title: "Thank you!",
        text: "Your feedback has been submitted.",
        timer: 1800,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#f1f5f9",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not submit",
        text: err.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#f87171",
        background: "#0f172a",
        color: "#f1f5f9",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (f) => {
    setEditingId(f._id);
    setEditMessage(f.message);
    setEditRating(f.rating);
  };

  const saveEdit = async (id) => {
    const msg = editMessage.trim();
    if (msg.length < 10) {
      Swal.fire({
        icon: "warning",
        title: "Too short",
        text: "Feedback must be at least 10 characters.",
        confirmButtonColor: "#f59e0b",
        background: "#0f172a",
        color: "#f1f5f9",
      });
      return;
    }
    try {
      await API.patch(`/feedback/mine/${id}`, { message: msg, rating: editRating });
      setEditingId(null);
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.response?.data?.message || "Try again.",
        confirmButtonColor: "#f87171",
        background: "#0f172a",
        color: "#f1f5f9",
      });
    }
  };

  const removeMine = async (id) => {
    const r = await Swal.fire({
      icon: "question",
      title: "Remove this feedback?",
      showCancelButton: true,
      confirmButtonText: "Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f87171",
      background: "#0f172a",
      color: "#f1f5f9",
    });
    if (!r.isConfirmed) return;
    try {
      await API.delete(`/feedback/mine/${id}`);
      await load();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not delete",
        text: err.response?.data?.message || "Try again.",
        confirmButtonColor: "#f87171",
        background: "#0f172a",
        color: "#f1f5f9",
      });
    }
  };

  return (
    <div className="app-page min-h-screen font-sans pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-10 relative z-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 mb-8 transition-colors"
        >
          <FiArrowLeft /> Back to dashboard
        </Link>

        <header className="mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Your voice matters
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            Feedback & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">rating</span>
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Share ideas, report issues, or tell us what you love about UniConnect. Rate your
            experience from 1–5 stars. Community feedback shown below is moderated so everyone
            sees a respectful space.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-[2rem] p-8 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2">Send feedback</h2>
              <p className="text-xs text-slate-500 mb-6">Logged in as {user?.name || user?.email}</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Rating
                  </label>
                  <StarInput value={rating} onChange={setRating} disabled={submitting} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Your message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    placeholder="Tell us what works well, what we can improve, or any bugs you noticed… (min. 10 characters)"
                    className="app-input w-full rounded-2xl px-4 py-3 text-sm placeholder-slate-500 resize-y min-h-[140px]"
                  />
                  <p className="text-[10px] text-slate-600 mt-1">{message.length} / 2000</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn-primary w-full rounded-2xl py-3.5 font-bold disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Submit feedback"}
                </button>
              </form>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[2rem] p-6">
              <h3 className="text-sm font-bold text-white mb-3">Your submissions</h3>
              {loading ? (
                <p className="text-slate-500 text-sm">Loading…</p>
              ) : mine.length === 0 ? (
                <p className="text-slate-500 text-sm">You haven&apos;t submitted feedback yet.</p>
              ) : (
                <ul className="space-y-4">
                  {mine.map((f) => {
                    const canEdit = f.visibleToUsers !== false;
                    return (
                    <li
                      key={f._id}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      {editingId === f._id && canEdit ? (
                        <div className="space-y-3">
                          <StarInput value={editRating} onChange={setEditRating} />
                          <textarea
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            rows={4}
                            className="app-input w-full rounded-xl px-3 py-2 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(f._id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 rounded-lg border border-white/20 text-slate-300 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <StarDisplay rating={f.rating} />
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                f.visibleToUsers
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-amber-500/15 text-amber-400"
                              }`}
                            >
                              {f.visibleToUsers ? "Visible to community" : "Hidden by admin"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap">{f.message}</p>
                          <p className="text-[10px] text-slate-600 mt-2">
                            {new Date(f.createdAt).toLocaleString()}
                          </p>
                          {!canEdit && (
                            <p className="text-[10px] text-slate-500 mt-2">
                              This entry was hidden from the community and can&apos;t be edited.
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => startEdit(f)}
                                className="text-xs text-amber-400 font-semibold hover:underline"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeMine(f._id)}
                              className="text-xs text-red-400 font-semibold hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <section className="lg:col-span-3">
            <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[2rem] p-8 min-h-[400px]">
              <h2 className="text-lg font-bold text-white mb-2">Community feedback</h2>
              <p className="text-xs text-slate-500 mb-6">
                Shown after moderation. Inappropriate posts are hidden from this list.
              </p>
              {loading ? (
                <p className="text-slate-500">Loading…</p>
              ) : publicList.length === 0 ? (
                <p className="text-slate-500 text-sm">No public feedback yet — be the first to share!</p>
              ) : (
                <ul className="space-y-5">
                  {publicList.map((f) => (
                    <li
                      key={f._id}
                      className="border-b border-white/5 pb-5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-amber-500/30 flex items-center justify-center text-xs font-bold text-white">
                          {(f.authorName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{f.authorName}</p>
                          <StarDisplay rating={f.rating} />
                        </div>
                        <span className="ml-auto text-[10px] text-slate-600">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap pl-12">
                        {f.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default StudentFeedbackPage;
