const mongoose = require('mongoose');

const groupTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    // Date key used by the calendar in the UI, e.g. "2026-04-03".
    date: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastReminderSentAt: { type: Date, default: null },
    // Stores sent reminder keys like "2026-04-03:1" meaning "sent on 2026-04-03 for due-in-1-day reminder".
    lastReminderSentKeys: { type: [String], default: [] },
  },
  { timestamps: true }
);

const groupReminderSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 160 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

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
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Workspace state (persists across refresh and is shared across members)
    tasks: { type: [groupTaskSchema], default: [] },
    reminders: { type: [groupReminderSchema], default: [] }
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
