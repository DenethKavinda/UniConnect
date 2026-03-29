const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL.toLowerCase()
    });

    if (existingAdmin) {
      console.log("System admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      isBlocked: false
    });

    console.log("System admin created successfully");
  } catch (error) {
    console.error("Error while creating system admin:", error.message);
  }
};

module.exports = seedAdmin;

// start backend - check db ystem admin account -- else - create ystem admin account