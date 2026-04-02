const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createFeedback,
  listPublicFeedback,
  listMyFeedback,
  updateMyFeedback,
  deleteMyFeedback,
} = require("../controllers/feedbackController");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "feedback" });
});

router.post("/", protect, createFeedback);
router.get("/public", protect, listPublicFeedback);
router.get("/mine", protect, listMyFeedback);
router.patch("/mine/:id", protect, updateMyFeedback);
router.delete("/mine/:id", protect, deleteMyFeedback);

module.exports = router;
