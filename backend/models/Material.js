const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  faculty: { type: String, required: true },
  specialization: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  file: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Material", MaterialSchema);
