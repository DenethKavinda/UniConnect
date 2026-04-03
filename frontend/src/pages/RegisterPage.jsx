import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

/** Placeholder-only hints (watermark; hidden while typing). Match validation rules. */
const PLACEHOLDER = {
  firstName: "e.g. Nimal — use your real first name",
  lastName: "e.g. Perera — use your real last name",
  username: "e.g. nimal_99 — 3–30 chars: letters, numbers, _ only",
  email: "e.g. you@gmail.com — must include @ and a domain",
  phone: "e.g. +94 77 123 4567 — min 8 digits, + optional",
  password: "Min. 6 characters",
  confirmPassword: "Type the same password again",
};

const inputWatermarkClass =
  "app-input w-full rounded-xl px-4 py-3 text-sm placeholder:text-slate-500/45 placeholder:text-[13px]";

/** Digits only — must match backend (at least 8 digits) */
function phoneDigits(raw) {
  return String(raw || "").replace(/\D/g, "");
}

function validateRegisterForm(form) {
  const firstName = form.firstName?.trim() ?? "";
  const lastName = form.lastName?.trim() ?? "";
  const username = form.username?.trim() ?? "";
  const email = form.email?.trim() ?? "";
  const phone = form.phone?.trim() ?? "";
  const password = form.password?.trim() ?? "";
  const confirmPassword = form.confirmPassword?.trim() ?? "";

  if (
    !firstName ||
    !lastName ||
    !username ||
    !email ||
    !phone ||
    !password ||
    !confirmPassword
  ) {
    return "All fields are required";
  }

  const userRe = /^[a-zA-Z0-9_]{3,30}$/;
  if (!userRe.test(username)) {
    return "Username must be 3–30 characters (letters, numbers, underscore only)";
  }

  if (!email.includes("@")) {
    return "Email must contain @";
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return "Enter a valid email address";
  }

  const ph = phoneDigits(phone);
  if (ph.length < 8) {
    return "Enter a valid phone number (at least 8 digits)";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
}

/** Same base as axios; uses fetch + JSON.stringify so the body always arrives as JSON on the server. */
async function postRegisterJson(payload) {
  const base = String(API.defaults.baseURL || "/api").replace(/\/$/, "");
  const url = `${base}/auth/register`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || res.statusText || "Registration failed" };
  }

  if (!res.ok) {
    const err = new Error(typeof data.message === "string" ? data.message : "Registration failed");
    err.response = { data };
    throw err;
  }
  return data;
}

/** Read values from actual inputs (more reliable than FormData with some browsers/password managers). */
function readRegisterFormFromDom(formEl) {
  const names = [
    "firstName",
    "lastName",
    "username",
    "email",
    "phone",
    "password",
    "confirmPassword",
  ];
  const out = {};
  for (const name of names) {
    const input = formEl.querySelector(`input[name="${name}"]`);
    out[name] = input ? String(input.value ?? "") : "";
  }
  return out;
}

function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formEl = e.currentTarget;
    const fromDom = readRegisterFormFromDom(formEl);

    const clientError = validateRegisterForm(fromDom);
    if (clientError) {
      return setError(clientError);
    }

    const firstName = fromDom.firstName.trim();
    const lastName = fromDom.lastName.trim();
    const username = fromDom.username.trim();
    const email = fromDom.email.trim();
    const phone = fromDom.phone.trim();
    const password = fromDom.password.trim();
    const confirmPassword = fromDom.confirmPassword.trim();

    const payload = {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      confirmPassword,
    };

    setSubmitting(true);
    try {
      await postRegisterJson(payload);

      setSuccess("Registration successful");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      const data = err.response?.data;
      let msg =
        (typeof data === "string" ? data : data?.message) ||
        data?.error ||
        err.message ||
        "Registration failed";
      if (data?.missing?.length) {
        msg = `${msg} (${data.missing.join(", ")})`;
      }
      if (data?.receivedKeys?.length) {
        msg = `${msg} — server saw keys: ${data.receivedKeys.join(", ")}`;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
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

        {/* Uncontrolled inputs: real DOM values are sent (fixes React controlled + autofill empty body) */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="reg-firstName" className="text-xs font-medium text-[var(--app-text-muted)]">
              First name
            </label>
            <input
              id="reg-firstName"
              type="text"
              name="firstName"
              autoComplete="given-name"
              placeholder={PLACEHOLDER.firstName}
              className={inputWatermarkClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-lastName" className="text-xs font-medium text-[var(--app-text-muted)]">
              Last name
            </label>
            <input
              id="reg-lastName"
              type="text"
              name="lastName"
              autoComplete="family-name"
              placeholder={PLACEHOLDER.lastName}
              className={inputWatermarkClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-username" className="text-xs font-medium text-[var(--app-text-muted)]">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              name="username"
              autoComplete="username"
              placeholder={PLACEHOLDER.username}
              className={inputWatermarkClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-xs font-medium text-[var(--app-text-muted)]">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={PLACEHOLDER.email}
              className={inputWatermarkClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-phone" className="text-xs font-medium text-[var(--app-text-muted)]">
              Phone number
            </label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder={PLACEHOLDER.phone}
              className={inputWatermarkClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-xs font-medium text-[var(--app-text-muted)]">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder={PLACEHOLDER.password}
              className={inputWatermarkClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-confirmPassword" className="text-xs font-medium text-[var(--app-text-muted)]">
              Confirm password
            </label>
            <input
              id="reg-confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder={PLACEHOLDER.confirmPassword}
              className={inputWatermarkClass}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="app-btn-primary w-full rounded-xl py-3 font-semibold transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Please wait…" : "Register"}
          </button>
        </form>

        <p className="app-text-muted mt-5 text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[var(--app-primary)] hover:brightness-110"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
