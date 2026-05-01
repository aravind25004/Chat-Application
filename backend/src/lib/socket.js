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

// used to store online users
const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// ✅ Helper function to calculate unread counts for a user
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

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("User ID from query:", userId);
  
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("User added to map:", { userId, socketId: socket.id });
  }

  console.log("Current online users:", Object.keys(userSocketMap));
  
  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Send initial unread counts when user connects
  getUserUnreadCounts(userId).then((unreadCounts) => {
    socket.emit("unreadCounts", unreadCounts);
  });

  // ✅ Emit unread counts every 1 second
  const unreadInterval = setInterval(async () => {
    const unreadCounts = await getUserUnreadCounts(userId);
    socket.emit("unreadCounts", unreadCounts);
  }, 1000);

  //Typing logic
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

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    clearInterval(unreadInterval);
    delete userSocketMap[userId];
    console.log("Online users after disconnect:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };