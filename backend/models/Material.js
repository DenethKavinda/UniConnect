const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  faculty: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  specialization: { type: String, required: true },
  module: { type: String, required: true },
  fileUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Material", materialSchema);
