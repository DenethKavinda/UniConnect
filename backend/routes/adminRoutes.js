const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUser,
  changeUserRole,
  toggleBlockUser,
  deleteUser,
  sendTestEmailAdmin,
} = require("../controllers/adminController");

const {
  listAllFeedbackAdmin,
  updateFeedbackAdmin,
  deleteFeedbackAdmin,
} = require("../controllers/feedbackController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

router.get("/feedback", protect, adminOnly, listAllFeedbackAdmin);
router.patch("/feedback/:id", protect, adminOnly, updateFeedbackAdmin);
router.delete("/feedback/:id", protect, adminOnly, deleteFeedbackAdmin);

router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id", protect, adminOnly, updateUser);
router.put("/users/:id/role", protect, adminOnly, changeUserRole);
router.put("/users/:id/block", protect, adminOnly, toggleBlockUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

router.post("/test-email", protect, adminOnly, sendTestEmailAdmin);

module.exports = router;