const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Material = require("../models/Material");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
      fileUrl: req.file.filename,
<<<<<<< HEAD
=======
      // status = "pending" by default
>>>>>>> member2-materials
    });

    await newMaterial.save();
    res.status(201).json({ success: true, material: newMaterial });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

<<<<<<< HEAD
=======
// ---------------- GET ONLY APPROVED ----------------
>>>>>>> member2-materials
router.get("/", async (req, res) => {
  try {
    const materials = await Material.find({ status: "approved" }).sort({
      uploadedAt: -1,
    });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

<<<<<<< HEAD
=======
// ---------------- GET ALL (ADMIN) ----------------
>>>>>>> member2-materials
router.get("/all", async (req, res) => {
  try {
    const materials = await Material.find({}).sort({
      uploadedAt: -1,
    });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

<<<<<<< HEAD
=======
// ---------------- GET PENDING (ADMIN) ----------------
>>>>>>> member2-materials
router.get("/pending", async (req, res) => {
  try {
    const materials = await Material.find({ status: "pending" }).sort({
      uploadedAt: -1,
    });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

<<<<<<< HEAD
=======
// ---------------- APPROVE ----------------
>>>>>>> member2-materials
router.put("/approve/:id", async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    );

    res.json(material);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

<<<<<<< HEAD
=======
// ---------------- REJECT ----------------
>>>>>>> member2-materials
router.put("/reject/:id", async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    );

    res.json(material);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

<<<<<<< HEAD
=======
// ---------------- DELETE MATERIAL ----------------
>>>>>>> member2-materials
router.delete("/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: "Material not found" });
    }

<<<<<<< HEAD
=======
    // Delete the file from uploads folder
>>>>>>> member2-materials
    const filePath = path.join(__dirname, "../uploads", material.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

<<<<<<< HEAD
=======
    // Delete from database
>>>>>>> member2-materials
    await Material.findByIdAndDelete(req.params.id);

    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

<<<<<<< HEAD
=======
// ---------------- FILE VIEW ----------------
>>>>>>> member2-materials
router.get("/file/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();

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
