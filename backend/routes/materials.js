const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Material = require("../models/Material");

// ---------------- MULTER CONFIG ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ---------------- UPLOAD MATERIAL ----------------
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { faculty, year, semester, specialization, module } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const newMaterial = new Material({
      faculty,
      year,
      semester,
      specialization,
      module,
      fileUrl: req.file.filename, // only store filename
    });

    await newMaterial.save();
    res.status(201).json({ success: true, material: newMaterial });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- GET ALL MATERIALS ----------------
router.get("/", async (req, res) => {
  try {
    const materials = await Material.find().sort({ uploadedAt: -1 });
    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- DOWNLOAD / VIEW ----------------
router.get("/file/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();

    // Set proper content type
    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".docx")
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (ext === ".pptx")
      contentType =
        "application/vnd.openxmlformats-officedocument.presentationml.presentation";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${req.params.filename}"`,
    );
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

module.exports = router;
