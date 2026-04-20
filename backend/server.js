import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import authRoutes from "./routes/auth.js";
import skillRoutes from "./routes/skills.js";
import swapRoutes from "./routes/swaps.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";
import reviewRoutes from "./routes/reviews.js";
import adminRoutes from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// --- Video Call State & Helpers ---
const rooms = new Map();

function cleanupRoom(roomId) {
  const room = rooms.get(roomId);
  if (room && room.size === 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted (empty)`);
  }
}

function handleUserLeaving(socket, reason, io) {
  if (socket.roomId && rooms.has(socket.roomId)) {
    const room = rooms.get(socket.roomId);
    const user = room.get(socket.id);
    
    if (user) {
      room.delete(socket.id);
      
      // Notify others about user leaving
      socket.to(socket.roomId).emit('user-left', {
        id: socket.id,
        name: user.name,
        reason: reason
      });

      // Send updated participant list to remaining users
      const remainingUsers = Array.from(room.values());
      socket.to(socket.roomId).emit('participants-updated', remainingUsers);
      
      // Clean up empty room
      cleanupRoom(socket.roomId);
    }
  }
}

// API endpoint to create new video room
app.get('/api/video/create-room', (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  res.json({ roomId });
});

// API endpoint to check if room exists
app.get('/api/video/room/:roomId', (req, res) => {
  const roomId = req.params.roomId.toUpperCase();
  const roomExists = rooms.has(roomId);
  res.json({ exists: roomExists, participantCount: roomExists ? rooms.get(roomId).size : 0 });
});
// ----------------------------------

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("send_message", (data) => {
    // Emit to the receiver's private room
    io.to(data.receiver).emit("receive_message", data);
  });

  socket.on("delete_message", (data) => {
    // Emit to the receiver's private room if data.receiver exists
    if (data.receiver) {
      io.to(data.receiver).emit("message_deleted", data.messageId);
    }
  });

  // --- Video Call Socket.IO Events ---
  socket.on('join-room', (roomId, userName) => {
    roomId = roomId.toUpperCase(); // Normalize room ID
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = userName;
    socket.joinTime = new Date();

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const room = rooms.get(roomId);
    
    // Check if user with same name already exists
    const existingUser = Array.from(room.values()).find(user => user.name === userName);
    let finalUserName = userName;
    if (existingUser) {
      finalUserName = `${userName} (${room.size + 1})`;
      socket.userName = finalUserName;
    }

    room.set(socket.id, {
      id: socket.id,
      name: finalUserName,
      videoEnabled: true,
      audioEnabled: true,
      joinTime: socket.joinTime
    });

    // Send room info to the joining user (existing users only, not including self)
    const existingUsers = Array.from(room.values()).filter(user => user.id !== socket.id);
    socket.emit('room-joined', {
      roomId: roomId,
      users: existingUsers,
      yourId: socket.id
    });

    // Notify others in the room about new user
    socket.to(roomId).emit('user-joined', {
      id: socket.id,
      name: finalUserName,
      videoEnabled: true,
      audioEnabled: true
    });

    // Send updated participant list to all users
    const allUsers = Array.from(room.values());
    io.to(roomId).emit('participants-updated', allUsers);
  });

  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      sender: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      sender: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });

  socket.on('toggle-video', (videoEnabled) => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      const user = room.get(socket.id);
      if (user) {
        user.videoEnabled = videoEnabled;
        socket.to(socket.roomId).emit('user-video-toggle', {
          userId: socket.id,
          videoEnabled: videoEnabled
        });
      }
    }
  });

  socket.on('toggle-audio', (audioEnabled) => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      const user = room.get(socket.id);
      if (user) {
        user.audioEnabled = audioEnabled;
        socket.to(socket.roomId).emit('user-audio-toggle', {
          userId: socket.id,
          audioEnabled: audioEnabled
        });
      }
    }
  });

  socket.on('chat-message', (message) => {
    if (socket.roomId) {
      const timestamp = new Date().toLocaleTimeString();
      const chatData = {
        id: socket.id,
        name: socket.userName,
        message: message,
        timestamp: timestamp
      };
      io.to(socket.roomId).emit('chat-message', chatData);
    }
  });

  socket.on('leave-room', () => {
    handleUserLeaving(socket, 'left', io);
  });

  socket.on('beforeunload', () => {
    handleUserLeaving(socket, 'refreshed', io);
  });
  // -----------------------------------

  socket.on("disconnect", () => {
    handleUserLeaving(socket, 'disconnected', io);
    console.log("User disconnected");
  });
});

import session from "express-session";
import passport from "./config/passport.js";

// ... existing code ...

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false,
}));
app.use(mongoSanitize());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiter to specific auth routes rather than all routes to avoid blocking users
app.use("/api/auth/login", limiter);
app.use("/api/auth/signup", limiter);
app.use("/api/admin/login", limiter);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" })); // Reduced limit from 50mb to 10mb for better security
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Session config (needed for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'skillswap_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Maintenance Mode Middleware ---
import PlatformSettings from "./models/PlatformSettings.js";
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/admin") || req.path === "/api/settings/public") {
    return next();
  }
  try {
    const settings = await PlatformSettings.findOne();
    if (settings && settings.maintenanceMode) {
      return res.status(503).json({ 
        message: "Platform is under maintenance.", 
        notice: settings.systemNotice 
      });
    }
  } catch (err) {
    console.error("Maintenance check failed:", err);
  }
  next();
});

app.get("/api/settings/public", async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne();
    res.json({ 
      platformName: settings?.platformName || "SkillSwap",
      maintenanceMode: settings?.maintenanceMode || false,
      systemNotice: settings?.systemNotice || ""
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});
// ------------------------------------

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date(), 
    uptime: process.uptime() 
  });
});

// 404 Handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found on server` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("[SERVER ERROR]", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "File upload error", error: err.message });
  }
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log("Server and MongoDB connection closed.");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log("Server and MongoDB connection closed.");
      process.exit(0);
    });
  });
});
