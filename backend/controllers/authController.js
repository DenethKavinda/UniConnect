// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Auth controller methods

// const register = async (req, res, next) => {
//   try {
//     // Implementation
//   } catch (error) {
//     next(error);
//   }
// };

// const login = async (req, res, next) => {
//   try {
//     // Implementation
//   } catch (error) {
//     next(error);
//   }
// };

// const logout = (req, res) => {
//   // Implementation
// };

// module.exports = {
//   register,
//   login,
//   logout
// };


const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/tokenGenerator");

/** Digits only — avoids +/spaces/dashes/unicode hyphen issues and keeps lookups consistent */
function phoneToDigits(raw) {
  return String(raw || "").replace(/\D/g, "");
}

const registerUser = async (req, res) => {
  try {
    const raw = req.body;
    const body =
      raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

    const t = (v) => String(v ?? "").trim();

    let firstName = t(body.firstName);
    let lastName = t(body.lastName);
    const legacyName = t(body.name);

    if ((!firstName || !lastName) && legacyName) {
      const parts = legacyName.split(/\s+/).filter(Boolean);
      if (!firstName) firstName = parts[0] || "";
      if (!lastName) lastName = parts.slice(1).join(" ") || firstName;
    }

    const username = t(body.username);
    const email = t(body.email);
    const phoneRaw = t(body.phone);
    const password = t(body.password);
    const confirmPassword = t(body.confirmPassword);

    const missing = [];
    if (!firstName) missing.push("firstName");
    if (!lastName) missing.push("lastName");
    if (!username) missing.push("username");
    if (!email) missing.push("email");
    if (!phoneRaw) missing.push("phone");
    if (!password) missing.push("password");
    if (!confirmPassword) missing.push("confirmPassword");
    if (missing.length) {
      return res.status(400).json({
        message: "All fields are required",
        missing,
        receivedKeys: Object.keys(body),
        hint: "POST JSON: firstName, lastName, username, email, phone, password, confirmPassword (or legacy: name, email, password + username, phone)",
      });
    }

    const fn = firstName;
    const ln = lastName;
    const un = username.toLowerCase();
    const em = email;
    const phDigits = phoneToDigits(phoneRaw);

    if (fn.length < 1 || ln.length < 1) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(un)) {
      return res.status(400).json({
        message: "Username must be 3–30 characters (letters, numbers, underscore only)",
      });
    }

    if (!em.includes("@")) {
      return res.status(400).json({ message: "Email must contain @" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(em)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (phDigits.length < 8) {
      return res.status(400).json({ message: "Enter a valid phone number (at least 8 digits)" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const emailLower = em.toLowerCase();

    const [byEmail, byPhone, byUsername] = await Promise.all([
      User.findOne({ email: emailLower }),
      User.findOne({
        $or: [{ phone: phDigits }, { phone: `+${phDigits}` }],
      }),
      User.findOne({ username: un }),
    ]);

    if (byEmail) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    if (byPhone) {
      return res.status(400).json({ message: "An account with this phone number already exists" });
    }
    if (byUsername) {
      return res.status(400).json({ message: "This username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = `${fn} ${ln}`.trim();

    const newUser = await User.create({
      firstName: fn,
      lastName: ln,
      name: displayName,
      username: un,
      phone: phDigits,
      email: emailLower,
      password: hashedPassword,
      role: "student",
      isBlocked: false,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        isBlocked: newUser.isBlocked,
      },
    });
  } catch (error) {
    const dupCode = error.code ?? error?.cause?.code;
    if (dupCode === 11000 || dupCode === "11000") {
      const key =
        (error.keyValue && Object.keys(error.keyValue)[0]) ||
        (error.keyPattern && Object.keys(error.keyPattern)[0]) ||
        "field";
      const label =
        key === "email"
          ? "email"
          : key === "phone"
            ? "phone number"
            : key === "username"
              ? "username"
              : key;
      return res.status(400).json({ message: `This ${label} is already registered` });
    }
    if (error.name === "ValidationError" && error.errors) {
      const first = Object.values(error.errors)[0];
      return res.status(400).json({ message: first?.message || "Validation failed" });
    }
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account is blocked" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};