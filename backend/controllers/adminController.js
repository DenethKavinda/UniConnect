const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, isBlocked } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email) {
      const duplicateEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    user.name = name ?? user.name;
    user.email = email ? email.toLowerCase() : user.email;
    user.role = role ?? user.role;
    user.isBlocked =
      typeof isBlocked === "boolean" ? isBlocked : user.isBlocked;

    await user.save();

    const updatedUser = await User.findById(req.params.id).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleBlockUser = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sendTestEmailAdmin = async (req, res) => {
  try {
    const to = String(req.body?.to || "").trim();
    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required (field: to)",
      });
    }

    const result = await sendEmail({
      to,
      subject: "UniConnect test email",
      text: "This is a UniConnect test email. If you received this, Gmail sending is working.",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
          <h2 style="margin: 0 0 8px 0;">UniConnect test email</h2>
          <p style="margin: 0 0 8px 0;">If you received this, Gmail sending is working.</p>
          <p style="margin: 0; opacity: .75; font-size: 12px;">Sent by UniConnect</p>
        </div>
      `,
    });

    if (!result.ok) {
      return res.status(500).json({
        success: false,
        message: result.error || "Failed to send test email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test email sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to send test email",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  changeUserRole,
  toggleBlockUser,
  deleteUser,
  sendTestEmailAdmin,
};