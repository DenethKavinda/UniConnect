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

    if (!form.email || !form.password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter your email and password.",
        confirmButtonColor: "#3b82f6", // Changed to Blue
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
    <div className="min-h-screen bg-[#0a0d17] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md relative overflow-hidden bg-[rgba(255,255,255,0.03)] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10">
            <h2 className="mb-2 text-center text-3xl font-black text-white tracking-tight">
              Login
            </h2>

            <p className="mb-8 text-center text-sm text-slate-400 font-medium uppercase tracking-widest">
              Sign in to <span className="text-blue-400">UniConnect</span>
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3.5 font-black uppercase tracking-widest text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Enter Platform"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 font-medium">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-black text-amber-500 hover:text-amber-400 transition-colors"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;