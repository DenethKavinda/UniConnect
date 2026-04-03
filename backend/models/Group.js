const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true },
    moduleSubject: { type: String, required: true, trim: true },
    facultyTag: { type: String, default: 'General', trim: true },
    description: { type: String, required: true, trim: true },
    // Backward compatible: keep existing `privacy` but also store `privacyType`.
    privacy: {
      type: String,
      enum: ['public', 'private', 'request'],
      default: 'public'
    },
    privacyType: {
      type: String,
      enum: ['public', 'private', 'request'],
      default: 'public'
    },
    memberLimit: { type: Number, default: 40, min: 2 },
    avatarPreset: { type: String, default: 'book' },
    avatarFileName: { type: String, default: '' },
    features: {
      sharedMaterials: { type: Boolean, default: true },
      discussionForum: { type: Boolean, default: true },
      taskTracker: { type: Boolean, default: false }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

groupSchema.pre('save', function syncPrivacyFields(next) {
  if (!this.privacyType && this.privacy) {
    this.privacyType = this.privacy;
  }
  if (!this.privacy && this.privacyType) {
    this.privacy = this.privacyType;
  }
  next();
});

groupSchema.index({ groupName: 1, moduleSubject: 1, createdBy: 1 }, { unique: true });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
