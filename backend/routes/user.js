const express = require("express");
const multer = require("multer");
const path = require("path");

const { protect } = require("../middleware/authMiddleware");
const {
  updateAvatar,
  updateSettings,
  ensureAvatarDir,
  UPLOAD_DIR,
} = require("../controllers/userSettingsController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureAvatarDir();
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]);
  if (!allowed.has(file.mimetype)) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

// Avatar upload
router.post("/update-avatar", protect, (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, updateAvatar);

// Settings update (username/password)
router.put("/settings", protect, updateSettings);

module.exports = router;
