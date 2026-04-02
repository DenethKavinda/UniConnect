const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  faculty: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  specialization: { type: String, required: true },
  module: { type: String, required: true },
  fileUrl: { type: String, required: true },
<<<<<<< HEAD
=======

>>>>>>> member2-materials
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
<<<<<<< HEAD
=======

>>>>>>> member2-materials
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Material", materialSchema);
