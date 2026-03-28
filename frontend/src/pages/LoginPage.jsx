import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

function LoginPage() {
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
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid Gmail address (example@gmail.com).",
        confirmButtonColor: "#14b8a6",
        background: "#0f172a",
        color: "#ffffff",
      });
      return;
    }

    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\/`~+=;']).{8,}$/;
    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must be at least 8 characters and include a special character.",
        confirmButtonColor: "#14b8a6",
        background: "#0f172a",
        color: "#ffffff",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", { email, password });

      const token = res.data.token;
      const user = res.data.user;

      login(token, user);

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome to UniConnect!",
        timer: 1500,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#ffffff",
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
        confirmButtonColor: "#ef4444",
        background: "#0f172a",
        color: "#ffffff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050b19] via-[#0b1224] to-[#101e39] p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">
          Login
        </h2>

        <p className="mb-6 text-center text-sm text-slate-400">
          Sign in to UniConnect
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
              placeholder="Enter Gmail (e.g., nimal@gmail.com)"
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
              placeholder="Enter password (e.g., Uni@1234)"
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
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-teal-400 hover:text-teal-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;