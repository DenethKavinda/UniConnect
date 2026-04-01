import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";
import Swal from "sweetalert2";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);

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
        confirmButtonColor: t.accent,
        background: t.surfaceSoft || t.surfaceMuted,
        color: t.text,
      });
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      const token = res.data.token;
      const user = res.data.user;

      login(token, user);

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome to UniConnect!",
        timer: 1500,
        showConfirmButton: false,
        background: t.surfaceSoft || t.surfaceMuted,
        color: t.text,
      });

      if (user?.role === "admin") {
        navigate("/adminDashboard");
      } else if (user?.role === "student") {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: message,
        confirmButtonColor: t.red,
        background: t.surfaceSoft || t.surfaceMuted,
        color: t.text,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page flex min-h-screen items-center justify-center p-4">
      <div className="app-surface w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-[var(--app-text)]">
          Login
        </h2>

        <p className="app-text-muted mb-6 text-center text-sm">
          Sign in to UniConnect
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="app-text-muted mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="app-input w-full rounded-xl px-4 py-3 placeholder-slate-500"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="app-text-muted mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="app-input w-full rounded-xl px-4 py-3 placeholder-slate-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="app-btn-primary w-full rounded-xl py-3 font-semibold transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="app-text-muted mt-5 text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[var(--app-primary)] hover:brightness-110"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;