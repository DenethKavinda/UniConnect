require("dotenv").config();
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Prefer reliable DNS resolvers for Atlas SRV records (helps avoid querySrv ECONNREFUSED)
dns.setServers(["1.1.1.1", "8.8.8.8"]);

if (!process.env.JWT_SECRET) {
  console.error('❌ Missing JWT_SECRET. Set JWT_SECRET in backend/.env');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Route registration
app.use("/api/posts", require("./routes/posts"));
app.use("/api/comments", require("./routes/comments"));

=======
>>>>>>> main
// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

const listenWithRetry = (port, retriesLeft = 10) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE" && retriesLeft > 0) {
      const nextPort = Number(port) + 1;
      console.warn(`Port ${port} in use, trying ${nextPort}...`);
      setTimeout(() => listenWithRetry(nextPort, retriesLeft - 1), 250);
      return;
    }

    console.error("❌ Failed to bind server:", err);
    process.exit(1);
  });
};

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    listenWithRetry(PORT);
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
