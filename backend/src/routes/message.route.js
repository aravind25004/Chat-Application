import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserForSidebar,getMessages,sendMessage,markMessagesAsRead } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users",protectRoute,getUserForSidebar);
router.get("/:id",protectRoute,getMessages);
router.post("/send/:id",protectRoute,sendMessage);
router.post("/mark-read/:id",protectRoute,markMessagesAsRead);
export default router;