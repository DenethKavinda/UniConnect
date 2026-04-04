require("dotenv").config();
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const path = require("path");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const seedAdmin = require("./utils/seedAdmin");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const materialRoutes = require("./routes/materials");
const groupRoutes = require("./routes/groups");
const feedbackRoutes = require("./routes/feedback");
const dashboardRoutes = require("./routes/dashboard");
const userSettingsRoutes = require("./routes/user");
const { startTaskDeadlineReminderJob } = require("./jobs/taskDeadlineReminderJob");

const app = express();
const httpServer = http.createServer(app);

// Prefer reliable DNS resolvers for Atlas SRV records
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Middleware
app.use(cors());
app.use(express.json({ limit: "40mb" }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/user", userSettingsRoutes);

// app.use("/api/materials", require("./routes/materials"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});

const PORT = process.env.PORT || 5000;

// In dev, do not auto-switch ports: Vite proxies to :5000 by default; a zombie process there causes 404s while this server binds to 5001+.
const allowPortFallback =
  process.env.ALLOW_PORT_FALLBACK === "true" || process.env.NODE_ENV === "production";

const listenWithRetry = (startPort, retriesLeft = 10) =>
  new Promise((resolve, reject) => {
    const tryListen = (port, left) => {
      const cleanup = () => {
        httpServer.off("listening", onListening);
        httpServer.off("error", onError);
      };

      const onListening = () => {
        cleanup();
        console.log(`Server running on port ${port}`);
        const wanted = Number(process.env.PORT || 5000);
        if (Number(port) !== wanted) {
          console.warn(
            `\n>>> WARNING: Server is on port ${port} (wanted ${wanted}). Point the frontend / Vite proxy at ${port}. <<<\n`,
          );
        }
        resolve(port);
      };

      const onError = (err) => {
        cleanup();
        if (err?.code === "EADDRINUSE") {
          if (!allowPortFallback) {
            return reject(
              new Error(
                `Port ${port} is already in use. Stop the other Node/process on that port (often an old backend), or set PORT and ALLOW_PORT_FALLBACK=true, and match Vite proxy target.`,
              ),
            );
          }
          if (left > 0) {
            const nextPort = Number(port) + 1;
            console.warn(`Port ${port} in use, trying ${nextPort}...`);
            setTimeout(() => tryListen(nextPort, left - 1), 250);
            return;
          }
        }
        reject(err);
      };

      httpServer.once("listening", onListening);
      httpServer.once("error", onError);

      try {
        httpServer.listen(port);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    tryListen(startPort, retriesLeft);
  });

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:3005",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
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

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.DB_URI);
    console.log(" MongoDB connected successfully");

    startTaskDeadlineReminderJob();

    await seedAdmin();
    const boundPort = await listenWithRetry(PORT);
    console.log(
      ` Feedback API: http://127.0.0.1:${boundPort}/api/feedback/health  (POST /api/feedback, GET /public, /mine)`,
    );
  } catch (err) {
    console.error(" Server start error:", err.message || err);
    process.exit(1);
  }
};

startServer();