// backend/server.js
require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
const connectDB = require("./config/db");
=======
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const groupRoutes = require('./routes/groups');
const { errorHandler } = require('./middleware/errorHandler');
>>>>>>> 2fb574633c18fa5652899ced7fb50adc3ff99b81

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

<<<<<<< HEAD
=======
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/groups', groupRoutes);

app.use(errorHandler);

// Start server
>>>>>>> 2fb574633c18fa5652899ced7fb50adc3ff99b81
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
