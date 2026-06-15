import express from "express";
import {
  sendMessage,
  getConversation,
  markMessageAsRead,
  getUserStatus,
  getUnreadCount,
  getChatList,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Both customer and provider must be authenticated
router.post("/", protect, sendMessage);

router.get("/unread-count", protect, getUnreadCount);

router.get("/chat-list", protect, getChatList);

router.get("/status/:userId", protect, getUserStatus);

router.get("/:bookingId", protect, getConversation);

router.patch("/:bookingId/read", protect, markMessageAsRead);

export default router;
