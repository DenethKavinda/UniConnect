import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const studentEmail = form.studentEmail.trim().toLowerCase();

    // Required fields example: Nimal | Perera | nimal@gmail.com | Uni@1234
    if (!firstName || !lastName || !studentEmail || !form.password || !form.confirmPassword) {
      return setError("All fields are required");
    }

    if (firstName.length < 2 || lastName.length < 2) {
      return setError("First name and last name must be at least 2 characters");
    }

    const studentEmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!studentEmailRegex.test(studentEmail)) {
      return setError("Please enter a valid Gmail address (example@gmail.com)");
    }

    // Password example: Uni@1234 (8+ chars and at least one special character)
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\/`~+=;']).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      return setError("Password must be at least 8 characters and include a special character");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await API.post("/auth/register", {
        name: `${firstName} ${lastName}`,
        email: studentEmail,
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050b19] via-[#0b1224] to-[#101e39] p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-white">
          Register
        </h2>

        <p className="mb-6 text-center text-sm text-slate-400">
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
            name="firstName"
            value={form.firstName}
            placeholder="First name (e.g., Nimal)"
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />

          <input
            type="text"
            name="lastName"
            value={form.lastName}
            placeholder="Last name (e.g., Perera)"
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />

          <input
            type="email"
            name="studentEmail"
            value={form.studentEmail}
            placeholder="Email (e.g., nimal@gmail.com)"
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Password (e.g., Uni@1234)"
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            placeholder="Confirm password (e.g., Uni@1234)"
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-[#050b19] px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />

          <button className="w-full rounded-xl bg-teal-500 py-3 font-semibold text-white transition-all duration-200 hover:bg-teal-600">
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-teal-400 hover:text-teal-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;