const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUser,
  changeUserRole,
  toggleBlockUser,
  deleteUser
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id", protect, adminOnly, updateUser);
router.put("/users/:id/role", protect, adminOnly, changeUserRole);
router.put("/users/:id/block", protect, adminOnly, toggleBlockUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;