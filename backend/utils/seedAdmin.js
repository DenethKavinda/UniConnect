const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const adminSeeds = [];

    // New format: ADMIN1_EMAIL/ADMIN1_PASSWORD (up to 4)
    for (let i = 1; i <= 4; i++) {
      const email = process.env[`ADMIN${i}_EMAIL`];
      const password = process.env[`ADMIN${i}_PASSWORD`];
      const name = process.env[`ADMIN${i}_NAME`] || `Admin ${i}`;

      if (email && password) {
        adminSeeds.push({ name, email, password });
      }
    }

    // Backward compatible: ADMIN_EMAIL/ADMIN_PASSWORD
    if (adminSeeds.length === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      adminSeeds.push({
        name: process.env.ADMIN_NAME || "System Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
    }

    if (adminSeeds.length === 0) {
      console.log("No admin seed credentials found; skipping admin seeding");
      return;
    }

    for (const seed of adminSeeds) {
      const emailLower = seed.email.toLowerCase();
      const existingAdmin = await User.findOne({ email: emailLower });

      if (existingAdmin) {
        const updates = [];

        if (existingAdmin.role !== "admin") {
          existingAdmin.role = "admin";
          updates.push("role");
        }

        if (existingAdmin.isBlocked) {
          existingAdmin.isBlocked = false;
          updates.push("isBlocked");
        }

        if (seed.password) {
          existingAdmin.password = await bcrypt.hash(seed.password, 10);
          updates.push("password");
        }

        if (seed.name && existingAdmin.name !== seed.name) {
          existingAdmin.name = seed.name;
          updates.push("name");
        }

        if (updates.length > 0) {
          await existingAdmin.save();
          console.log(`Updated admin (${updates.join(", ")}): ${emailLower}`);
        } else {
          console.log(`Admin already up-to-date: ${emailLower}`);
        }
        continue;
      }

      const hashedPassword = await bcrypt.hash(seed.password, 10);

      await User.create({
        name: seed.name,
        email: emailLower,
        password: hashedPassword,
        role: "admin",
        isBlocked: false,
      });

      console.log(`Admin created successfully: ${emailLower}`);
    }
  } catch (error) {
    console.error("Error while creating system admin:", error.message);
  }
};

module.exports = seedAdmin;

// start backend - check db ystem admin account -- else - create ystem admin account