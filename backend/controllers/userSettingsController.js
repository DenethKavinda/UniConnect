const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "avatars");

const ensureAvatarDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const relativeUrl = `/uploads/avatars/${req.file.filename}`;

    const updated = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: relativeUrl },
      { new: true }
    )
      .select("_id name email username role isBlocked avatarUrl")
      .lean();

    return res.json({
      message: "Avatar updated",
      user: {
        id: updated?._id,
        _id: updated?._id,
        name: updated?.name,
        email: updated?.email,
        username: updated?.username,
        role: updated?.role,
        isBlocked: updated?.isBlocked,
        avatarUrl: updated?.avatarUrl || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const body = req.body && typeof req.body === "object" ? req.body : {};

    const usernameRaw = body.username;
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    const updates = {};

    if (typeof usernameRaw === "string") {
      const username = usernameRaw.trim().toLowerCase();
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          message: "Username must be 3–30 characters (letters, numbers, underscore only)",
        });
      }

      const existing = await User.findOne({ username, _id: { $ne: userId } })
        .select("_id")
        .lean();
      if (existing) {
        return res.status(409).json({ message: "This username is already taken" });
      }

      updates.username = username;
    }

    const wantsPasswordChange = Boolean(newPassword || confirmPassword);
    if (wantsPasswordChange) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const user = await User.findById(userId).select("password");
      if (!user) return res.status(404).json({ message: "User not found" });

      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    // Email cannot be changed: ignore any incoming email field

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true })
      .select("_id name email username role isBlocked avatarUrl")
      .lean();

    return res.json({
      message: "Settings updated",
      user: {
        id: updated?._id,
        _id: updated?._id,
        name: updated?.name,
        email: updated?.email,
        username: updated?.username,
        role: updated?.role,
        isBlocked: updated?.isBlocked,
        avatarUrl: updated?.avatarUrl || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateAvatar,
  updateSettings,
  ensureAvatarDir,
  UPLOAD_DIR,
};
