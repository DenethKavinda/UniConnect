import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiSend, FiFileText } from "react-icons/fi";
import Swal from "sweetalert2";

function InquiryPage() {
  const [form, setForm] = useState({
    ref: "",
    seat: "",
    day: "",
    month: "",
    year: "",
    description: "",
  });

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 LOAD (for now local, later connect API)
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("inquiries")) || [];
    setInquiries(data);
  }, []);

  const saveToLocal = (data) => {
    localStorage.setItem("inquiries", JSON.stringify(data));
    setInquiries(data);
  };

  // ✅ SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.description.trim().length < 10) {
      Swal.fire({
        icon: "warning",
        title: "Too short",
        text: "Description must be at least 10 characters.",
        background: "#0f172a",
        color: "#fff",
      });
      return;
    }

    let updated;

    if (editingId) {
      updated = inquiries.map((i) =>
        i.id === editingId ? { ...form, id: editingId } : i,
      );
      setEditingId(null);
    } else {
      updated = [
        ...inquiries,
        { ...form, id: Date.now(), createdAt: new Date() },
      ];
    }

    saveToLocal(updated);

    setForm({
      ref: "",
      seat: "",
      day: "",
      month: "",
      year: "",
      description: "",
    });

    Swal.fire({
      icon: "success",
      title: "Saved!",
      timer: 1500,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#fff",
    });
  };

  // ✏️ EDIT
  const handleEdit = (item) => {
    setForm(item);
    setEditingId(item.id);
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete inquiry?",
      showCancelButton: true,
      confirmButtonColor: "#f87171",
      background: "#0f172a",
      color: "#fff",
    });

    if (!res.isConfirmed) return;

    const updated = inquiries.filter((i) => i.id !== id);
    saveToLocal(updated);
  };

  return (
    <div className="app-page min-h-screen font-sans pb-20">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-10 relative z-10">
        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 mb-8"
        >
          <FiArrowLeft /> Back to dashboard
        </Link>

        {/* Header */}
        <header className="mb-10">
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full">
            Support System
          </span>
          <h1 className="text-4xl font-black text-white mt-3">
            Inquiry <span className="text-indigo-400">Center</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Submit and manage your inquiries easily.
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* LEFT FORM */}
          <section className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4"
            >
              <input
                name="ref"
                value={form.ref}
                onChange={handleChange}
                placeholder="Student Name"
                className="app-input w-full"
                required
              />

              <input
                name="seat"
                value={form.seat}
                onChange={handleChange}
                placeholder="Seat No"
                className="app-input w-full"
                required
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  name="day"
                  placeholder="DD"
                  onChange={handleChange}
                  value={form.day}
                  className="app-input"
                  required
                />
                <input
                  name="month"
                  placeholder="MM"
                  onChange={handleChange}
                  value={form.month}
                  className="app-input"
                  required
                />
                <input
                  name="year"
                  placeholder="YYYY"
                  onChange={handleChange}
                  value={form.year}
                  className="app-input"
                  required
                />
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your issue..."
                className="app-input w-full min-h-[120px]"
                required
              />

              <button className="app-btn-primary w-full flex justify-center gap-2">
                {editingId ? "Update Inquiry" : "Submit Inquiry"} <FiSend />
              </button>
            </form>
          </section>

          {/* RIGHT LIST */}
          <section className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <FiFileText /> Your Inquiries
              </h2>

              {inquiries.length === 0 ? (
                <p className="text-slate-400">No inquiries yet.</p>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((item) => (
                    <div
                      key={item.id}
                      className="border border-white/10 p-4 rounded-xl"
                    >
                      <p className="text-sm text-slate-300">
                        <b>Ref:</b> {item.ref} | <b>Seat:</b> {item.seat}
                      </p>

                      <p className="text-sm text-indigo-400">
                        {item.day}/{item.month}/{item.year}
                      </p>

                      <p className="text-sm mt-2 text-slate-300">
                        {item.description}
                      </p>

                      <div className="flex gap-3 mt-3 text-xs">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-amber-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default InquiryPage;
