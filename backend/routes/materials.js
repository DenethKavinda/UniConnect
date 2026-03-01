const express = require("express");
const multer = require("multer");
const Material = require("../models/Material");
const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads/"), // save to uploads folder
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ================= UPLOAD MATERIAL =================
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { faculty, specialization, title, description } = req.body;
    const file = req.file.filename;

    const newMaterial = new Material({
      faculty,
      specialization,
      title,
      description,
      file,
    });

    await newMaterial.save();
    res.status(201).json({
      message: "Material uploaded successfully",
      material: newMaterial,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET ALL MATERIALS =================
router.get("/", async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET MATERIALS BY FACULTY & SPECIALIZATION =================
router.get("/:faculty/:specialization", async (req, res) => {
  try {
    const faculty = decodeURIComponent(req.params.faculty);
    const specialization = decodeURIComponent(req.params.specialization);

    const materials = await Material.find({
      faculty,
      specialization,
    }).sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
