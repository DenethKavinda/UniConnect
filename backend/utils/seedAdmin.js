const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getAdminConfigs = () => {
  const admins = [];

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_NAME) {
    admins.push({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
  }

  for (let i = 1; i <= 10; i += 1) {
    const name = process.env[`ADMIN${i}_NAME`];
    const email = process.env[`ADMIN${i}_EMAIL`];
    const password = process.env[`ADMIN${i}_PASSWORD`];

    if (!name && !email && !password) {
      continue;
    }

    if (name && email && password) {
      admins.push({ name, email, password });
    }
  }

  return admins;
};

const seedAdmin = async () => {
  try {
    const adminConfigs = getAdminConfigs();

    if (!adminConfigs.length) {
      console.log("No admin seed configuration found. Skipping admin seeding.");
      return;
    }

    for (const admin of adminConfigs) {
      const normalizedEmail = String(admin.email).toLowerCase();
      const existingAdmin = await User.findOne({ email: normalizedEmail });

      if (existingAdmin) {
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.password, 10);

      await User.create({
        name: admin.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin",
        isBlocked: false,
      });
    }

    console.log("Admin seed check completed");
  } catch (error) {
    console.error("Error while creating system admin:", error.message);
  }
};

module.exports = seedAdmin;