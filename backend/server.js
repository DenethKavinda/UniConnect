// backend/server.js
require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
