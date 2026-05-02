import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// helper
async function getUserUnreadCounts(userId) {
  try {
    const users = await User.find({ _id: { $ne: userId } }).select("_id");
    const unreadCounts = {};

    for (const user of users) {
      const unreadMessages = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        isRead: false,
      });
      unreadCounts[user._id] = unreadMessages;
    }

    return unreadCounts;
  } catch (error) {
    console.error("Error calculating unread counts:", error);
    return {};
  }
}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    // ✅ NEW: set user as online (update lastSeen immediately)
    await User.findByIdAndUpdate(userId, {
      lastSeen: new Date(),
    });
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // send unread counts
  getUserUnreadCounts(userId).then((unreadCounts) => {
    socket.emit("unreadCounts", unreadCounts);
  });

  const unreadInterval = setInterval(async () => {
    const unreadCounts = await getUserUnreadCounts(userId);
    socket.emit("unreadCounts", unreadCounts);
  }, 1000);

  // typing
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);

    clearInterval(unreadInterval);

    // ✅ NEW: update lastSeen on disconnect
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
      });
    }

    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };