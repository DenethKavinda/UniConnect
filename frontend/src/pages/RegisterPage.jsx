import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminTheme } from "../theme/adminTheme";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { isDark } = useAdminTheme();
  const t = getAdminTheme(isDark);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return setError("All fields are required");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess("Registration successful");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="app-page flex min-h-screen items-center justify-center p-4">
      <div className="app-surface w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-[var(--app-text)]">
          Register
        </h2>

        <p className="app-text-muted mb-6 text-center text-sm">
          Create your UniConnect account
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-800 bg-red-900/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-800 bg-green-900/30 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full name"
            onChange={handleChange}
            className="app-input w-full rounded-xl px-4 py-3 placeholder-slate-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="app-input w-full rounded-xl px-4 py-3 placeholder-slate-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="app-input w-full rounded-xl px-4 py-3 placeholder-slate-500"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            onChange={handleChange}
            className="app-input w-full rounded-xl px-4 py-3 placeholder-slate-500"
          />

          <button className="app-btn-primary w-full rounded-xl py-3 font-semibold transition-all duration-200 hover:brightness-110">
            Register
          </button>
        </form>

        <p className="app-text-muted mt-5 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--app-primary)] hover:brightness-110">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;