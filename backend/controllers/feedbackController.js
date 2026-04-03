const Feedback = require("../models/Feedback");

const createFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;
    const msg = String(message ?? "").trim();
    const rate = Number(rating);

    if (!msg) {
      return res.status(400).json({ message: "Feedback message is required" });
    }
    if (msg.length < 10) {
      return res.status(400).json({ message: "Feedback must be at least 10 characters" });
    }
    if (msg.length > 2000) {
      return res.status(400).json({ message: "Feedback cannot exceed 2000 characters" });
    }
    if (!Number.isInteger(rate) || rate < 1 || rate > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
    }

    const doc = await Feedback.create({
      user: req.user._id,
      message: msg,
      rating: rate,
      visibleToUsers: true,
    });

    const populated = await Feedback.findById(doc._id)
      .populate("user", "name email")
      .lean();

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      feedback: populated,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ message: first?.message || "Validation failed" });
    }
    res.status(500).json({ message: err.message });
  }
};

const listPublicFeedback = async (req, res) => {
  try {
    const items = await Feedback.find({ visibleToUsers: true })
      .sort({ createdAt: -1 })
      .limit(80)
      .populate("user", "name")
      .lean();

    const safe = items.map((f) => ({
      _id: f._id,
      message: f.message,
      rating: f.rating,
      createdAt: f.createdAt,
      authorName: f.user?.name || "Student",
    }));

    res.json({ success: true, feedback: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listMyFeedback = async (req, res) => {
  try {
    const items = await Feedback.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, feedback: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listAllFeedbackAdmin = async (req, res) => {
  try {
    const items = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email role")
      .lean();

    res.json({ success: true, feedback: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateFeedbackAdmin = async (req, res) => {
  try {
    const { visibleToUsers } = req.body;
    const fb = await Feedback.findById(req.params.id);

    if (!fb) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (typeof visibleToUsers !== "boolean") {
      return res.status(400).json({
        message: "Only visibility (show/hide) can be changed; feedback text is not editable.",
      });
    }

    fb.visibleToUsers = visibleToUsers;

    await fb.save();

    const populated = await Feedback.findById(fb._id)
      .populate("user", "name email role")
      .lean();

    res.json({
      success: true,
      message: "Feedback updated",
      feedback: populated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFeedbackAdmin = async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndDelete(req.params.id);
    if (!fb) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json({ success: true, message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMyFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;
    const fb = await Feedback.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!fb) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (fb.visibleToUsers === false) {
      return res.status(403).json({
        message:
          "This feedback was hidden by a moderator and can no longer be edited.",
      });
    }

    if (message !== undefined) {
      const msg = String(message).trim();
      if (msg.length < 10 || msg.length > 2000) {
        return res.status(400).json({
          message: "Message must be between 10 and 2000 characters",
        });
      }
      fb.message = msg;
    }

    if (rating !== undefined) {
      const rate = Number(rating);
      if (!Number.isInteger(rate) || rate < 1 || rate > 5) {
        return res.status(400).json({ message: "Rating must be 1–5" });
      }
      fb.rating = rate;
    }

    await fb.save();

    res.json({
      success: true,
      message: "Your feedback was updated",
      feedback: fb.toObject(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMyFeedback = async (req, res) => {
  try {
    const fb = await Feedback.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!fb) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json({ success: true, message: "Feedback removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createFeedback,
  listPublicFeedback,
  listMyFeedback,
  listAllFeedbackAdmin,
  updateFeedbackAdmin,
  deleteFeedbackAdmin,
  updateMyFeedback,
  deleteMyFeedback,
};
