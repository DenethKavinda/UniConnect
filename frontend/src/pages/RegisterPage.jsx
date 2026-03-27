import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      setLoading(true);
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
              Register
            </h2>

            <p className="mb-8 text-center text-sm text-slate-400 font-medium uppercase tracking-widest">
              Create your <span className="text-blue-400">UniConnect</span> account
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-xl border border-green-800/50 bg-green-900/20 px-4 py-3 text-sm text-green-400 text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password (min. 6 characters)"
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-6 rounded-xl bg-blue-600 py-3.5 font-black uppercase tracking-widest text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="font-black text-amber-500 hover:text-amber-400 transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;