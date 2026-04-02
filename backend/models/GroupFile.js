const mongoose = require('mongoose');

const groupFileSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedByLabel: { type: String, default: '', trim: true },
    originalName: { type: String, required: true, trim: true },
    storedName: { type: String, required: true, unique: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

groupFileSchema.index({ groupId: 1, createdAt: -1 });

const GroupFile = mongoose.model('GroupFile', groupFileSchema);

module.exports = GroupFile;
