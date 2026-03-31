require("dotenv").config();
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const adminRoutes = require("./routes/adminRoutes");
const materialRoutes = require("./routes/materials");
const groupRoutes = require("./routes/groups");

const app = express();
const httpServer = http.createServer(app);

// Prefer reliable DNS resolvers for Atlas SRV records (helps avoid querySrv ECONNREFUSED)
dns.setServers(["1.1.1.1", "8.8.8.8"]);

if (!process.env.JWT_SECRET) {
  console.error("? Missing JWT_SECRET. Set JWT_SECRET in backend/.env");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ??");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/groups", groupRoutes);
// app.use("/api/materials", require("./routes/materials"));

const PORT = process.env.PORT || 5000;

const listenWithRetry = (port, retriesLeft = 10) =>
  new Promise((resolve, reject) => {
    const onListening = () => {
      cleanup();
      console.log(`Server running on port ${port}`);
      resolve(port);
    };

    const onError = (err) => {
      cleanup();

      if (err?.code === "EADDRINUSE" && retriesLeft > 0) {
        const nextPort = Number(port) + 1;
        console.warn(`Port ${port} in use, trying ${nextPort}...`);
        return resolve(
          setTimeout(() => {
            listenWithRetry(nextPort, retriesLeft - 1)
              .then(resolve)
              .catch(reject);
          }, 250),
        );
      }

      reject(err);
    };

    const cleanup = () => {
      httpServer.off("listening", onListening);
      httpServer.off("error", onError);
    };

    httpServer.once("listening", onListening);
    httpServer.once("error", onError);

    try {
      httpServer.listen(port);
    } catch (err) {
      cleanup();
      reject(err);
    }
  });

// --- Socket.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:3005",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token;
    if (!authToken) return next(new Error("No token"));
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  socket.on("joinGroup", ({ groupId }) => {
    if (!groupId) return;
    socket.join(`group:${groupId}`);
  });

  socket.on("sendMessage", ({ groupId, text }) => {
    if (!groupId || !text) return;

    const message = {
      text: String(text),
      sender: socket.user?.name || socket.user?.email || "User",
      time: new Date().toISOString(),
    };

    io.to(`group:${groupId}`).emit("message", message);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await listenWithRetry(PORT);
  } catch (error) {
    console.error("? Failed to start server:", error?.message || error);
    process.exit(1);
  }
};

startServer();
