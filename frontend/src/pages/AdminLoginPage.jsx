import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter your email and password.",
        confirmButtonColor: "#14b8a6",
        background: "#0f172a",
        color: "#ffffff",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);
      const token = res.data.token;
      const user = res.data.user;

      if (!user || user.role !== "admin") {
        await Swal.fire({
          icon: "error",
          title: "Admin Login Failed",
          text: "This account is not an admin.",
          confirmButtonColor: "#ef4444",
          background: "#0f172a",
          color: "#ffffff",
        });
        return;
      }

      login(token, user);

      await Swal.fire({
        icon: "success",
        title: "Welcome, Admin",
        timer: 1200,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#ffffff",
      });

      navigate("/adminDashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: message,
        confirmButtonColor: "#ef4444",
        background: "#0f172a",
        color: "#ffffff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d17] text-slate-200 font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md relative overflow-hidden bg-[rgba(255,255,255,0.03)] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
          <div className="relative z-10">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">
          Admin Login
        </h2>

        <p className="mb-6 text-center text-sm text-slate-400">
          Sign in as an administrator
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
              placeholder="Enter admin email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-500 py-3 font-semibold text-white transition-all duration-200 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          Not an admin?{" "}
          <Link to="/login" className="font-semibold text-teal-400 hover:text-teal-300">
            Student Login
          </Link>
        </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
