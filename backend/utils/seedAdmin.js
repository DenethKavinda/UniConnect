const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME?.trim() || "System Admin";

    if (!adminEmail || !adminPassword) {
      console.warn(
        "Skipping system admin seed: ADMIN_EMAIL or ADMIN_PASSWORD is not configured"
      );
      return;
    }

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("System admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isBlocked: false,
    });

    console.log("System admin created successfully");
  } catch (error) {
    console.error("Error while creating system admin:", error.message);
  }
};

module.exports = seedAdmin;

// start backend - check db ystem admin account -- else - create ystem admin account